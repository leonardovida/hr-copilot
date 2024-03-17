import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
from fastapi.param_functions import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.paginated import PaginatedListResponse, compute_offset, paginated_response
from ...core.config import settings
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ...core.utils.cache import cache
from ...core.utils.kv import set_key_value
from ...core.utils.s3 import upload_s3_file
from ...crud.crud_parsed_job_description import crud_parsed_job_description
from ...crud.crud_parsed_resume import crud_parsed_resume
from ...crud.crud_resume import crud_resume
from ...crud.crud_scores import crud_scores
from ...crud.crud_users import crud_users
from ...schemas.common import CommonResponse
from ...schemas.parsed_job_description import ParsedJobDescriptionRead
from ...schemas.parsed_resume import ParsedResumeCreateInternal, ParsedResumeRead
from ...schemas.resume import ResumeCreate, ResumeCreateInternal, ResumeRead, ResumeUpdate
from ...schemas.score import ScoreCreateInternal
from ...schemas.user import UserRead
from ...services.resume.workflow import evaluate_resume, extract_resume_text
from ...services.scorer.calculation import score_calculation
from ..dependencies import get_current_user

router = APIRouter(tags=["resume"])


# TODO: remove me and add message queue
# celery using redis
async def combined_workflow(
    is_text_to_extract: bool,
    resume: ResumeRead,
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    # 1. Perform the PDF text extraction
    if is_text_to_extract:
        await set_key_value(key=f"job:{resume.job_id}:{resume.id}:extract_status", value=settings.STATUS_PROCESSING)
        text = await extract_resume_text(
            resume=resume,
        )
        resume_update = (ResumeUpdate(text=text),)
        await crud_resume.update(db=db, object=resume_update, id=resume.id)
        await set_key_value(key=f"job:{resume.job_id}:{resume.id}:extract_status", value=settings.STATUS_SUCCESS)

    # 2. Start the job description parsing
    parsed_job_description: ParsedJobDescriptionRead = await crud_parsed_job_description.get(
        db=db,
        id=resume.job_id,
        schema_to_select=ParsedJobDescriptionRead,
    )
    if parsed_job_description is None:
        raise ValueError("Parsed job description for resume not found.")

    result = await evaluate_resume(
        resume=resume,
        parsed_job_description=parsed_job_description,
    )
    created_parsed_resume = await crud_parsed_resume.create(
        db=db,
        object=ParsedResumeCreateInternal(
            job_description_id=resume.job_id,
            resume_id=resume.id,
            parsed_skills=result.model_dump(),
            created_by_user_id=resume.created_by_user_id,
        ),
    )

    parsed_resume: ParsedResumeRead = await crud_parsed_resume.get(
        db=db,
        schema_to_select=ParsedResumeRead,
        id=created_parsed_resume.id,
    )

    # 3. Trigger the score calculation for that resume
    score = await score_calculation(parsed_resume)
    await crud_scores.create(
        db=db,
        object=ScoreCreateInternal(
            resume_id=int(resume.id),
            job_id=int(resume.job_id),
            parsed_job_id=parsed_job_description.id,
            score=score,
            created_by_user_id=resume.created_by_user_id,
        ),
    )


# Note: removed the 'Form()' arguments to retrieve object from frontend
@router.post("/{username}/resume", response_model=ResumeRead, status_code=status.HTTP_200_OK)
async def create_resume(
    request: Request,
    background_tasks: BackgroundTasks,
    username: str,
    resume: ResumeCreate,
    # job_description_id: int = Form(...),
    # candidate: str = Form(...),
    # resume: UploadFile = File(...),
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    """Store a new PDF in the database.

    :param background_tasks: BackgroundTasks dependency.
    :param job_id: ID of the job description related to the PDF.
    :param candidate: Candidate name.
    :param resume: Resume file.
    :param resume_dao: DAO for Resumes models.
    :param score_dao: DAO for Score.
    :return: List of ResumeModelDTO.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    if isinstance(resume, str) or resume.pdf_file is None:
        raise HTTPException(status_code=400, detail="A PDF file is required")

    # Check if pdf_file size is not bigger than 30MB
    if resume.pdf_file.size is not None and resume.pdf_file.size > 30 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="The PDF uploaded is too large, please resize it and try again.")

    # Upload the PDF and create the resume entry
    file_name = str(uuid.uuid4())
    s3_url = await upload_s3_file(
        file=resume.pdf_file,
        file_name=f"{file_name}.pdf",
        folder_path=f"resume/{username}",  # we create a new path for each user
    )
    resume_internal_dict = resume.model_dump()
    resume_internal_dict["created_by_user_id"] = db_user["id"]
    resume_internal_dict["s3_url"] = s3_url
    resume_internal = ResumeCreateInternal(**resume_internal_dict)
    created_resume: ResumeRead = await crud_resume.create(db=db, object=resume_internal)

    # Start Background Task execution
    logging.info(f"Workflow: evaluate resume with ID {created_resume.id}")
    background_tasks.add_task(
        combined_workflow,
        resume=created_resume,
        resume_id=created_resume.id,
        is_text_to_extract=True,
    )

    return created_resume


@router.get(
    "/{username}/resumes",
    response_model=PaginatedListResponse[ResumeRead],
    status_code=status.HTTP_200_OK,
)
@cache(
    key_prefix="{username}_resumes:page_{page}:items_per_page:{items_per_page}",
    resource_id_name="username",
    expiration=60,
)
async def get_resumes(
    request: Request,
    username: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    job_id: int,
    page: int = 1,
    items_per_page: int = 20,
) -> dict:
    """Retrieve all non-deleted pdfs from the database for a given job id.

    :param job_id: the job_id for the jobs description related to the pdfs
    :param limit: limit of Resumes objects, defaults to 10.
    :param offset: offset of Resumes objects, defaults to 0.
    :param resume_dao: DAO for Resumes models.
    :return: list of Resumes objects from database.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if not db_user:
        raise NotFoundException("User not found")

    resume_data = await crud_resume.get_multi(
        db=db,
        job_id=job_id,  # TODO: check whether this actually filters the results
        offset=compute_offset(page, items_per_page),
        limit=items_per_page,
        schema_to_select=ResumeRead,
        created_by_user_id=db_user["id"],
        is_deleted=False,
    )

    return paginated_response(crud_data=resume_data, page=page, items_per_page=items_per_page)


@router.get(
    "/{username}/resume/{id}/process",
    response_model=ResumeRead,
    status_code=status.HTTP_200_OK,
)
async def process_resume(
    request: Request,
    username: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    id: int,
    background_tasks: BackgroundTasks,
    is_text_to_extract: bool = False,
) -> CommonResponse:
    """Trigger background tasks to process the PDF.

    :param job_id: ID of the job description related to the PDF.
    :param resume_id: ID of the PDF to process.
    :param parsed_job_description_dao: DAO for ParsedJobDescription models.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if not db_user:
        raise NotFoundException("User not found")

    # Trigger background tasks to process the PDF
    try:
        resume = await crud_resume.get(db=db, schema_to_select=ResumeRead, id=id)
        if resume is None:
            raise HTTPException(status_code=404, detail="Resume not found")
        logging.info(f"Evaluating resume - {id}")

        background_tasks.add_task(
            combined_workflow,
            is_text_to_extract=is_text_to_extract,
            resume=resume,
            db=db,
        )
        return CommonResponse(status=settings.STATUS_PROCESSING, message=f"Processing resume - {id}")
    except Exception as e:
        logging.error(f"Error processing PDF ID {id}: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.patch("/{username}/resume/{id}")
@cache("{username}_resume_cache", resource_id_name="id", pattern_to_invalidate_extra=["{username}_resumes:*"])
async def update_resume(
    request: Request,
    username: str,
    id: int,
    values: ResumeUpdate,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
    # candidate_name: str = Form(...),
) -> CommonResponse:
    """Update Resume Name.

    :param candidate_name: The candidate name.
    :raises HTTPException: if the pdf is not found.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    resume = await crud_resume.get(db=db, schema_to_select=ResumeRead, id=id, is_deleted=False)
    if resume is None:
        raise NotFoundException("Resume not found")
    await crud_resume.update(db=db, object=values, id=id)
    return CommonResponse(status=settings.STATUS_SUCCESS, message="Resume updated")


@router.get("/{username}/resume/{id}/", response_model=ResumeRead)
@cache(key_prefix="{username}_resume_cache", resource_id_name="id")
async def get_resume(
    request: Request,
    username: str,
    id: int,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    # resume_id: int,
) -> ResumeRead:
    """Retrieve a single resume from the database."""
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    db_resume: ResumeRead | None = await crud_resume.get(
        db=db, schema_to_select=ResumeRead, username=username, is_deleted=False, id=id
    )

    if db_resume is None:
        raise NotFoundException(detail="Resume not found")

    return db_resume


@router.delete("/{username}/resume/{id}")
@cache("{username}_resume_ache", resource_id_name="id", to_invalidate_extra={"{username}_resumes": "{username}"})
async def delete_resume(
    request: Request,
    username: str,
    id: int,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> CommonResponse:
    """Soft delete a single pdf from the database by its ID.

    :param id: the ID of the resume to delete
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    db_resume = await crud_resume.get(db=db, schema_to_select=ResumeRead(), id=id, is_deleted=False)
    if db_resume is None:
        raise NotFoundException("Resume not found")

    await crud_resume.delete(db=db, db_row=db_resume, id=id)

    return CommonResponse(status=settings.STATUS_SUCCESS, message="Post deleted")
