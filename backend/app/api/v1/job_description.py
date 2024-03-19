import logging
import uuid
from typing import Annotated

import fastapi
from fastapi import BackgroundTasks, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession


from ...api.paginated import PaginatedListResponse, compute_offset, paginated_response
from ...core.config import settings
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ...core.utils.cache import cache
from ...core.utils.s3 import upload_s3_file
from ...crud.crud_job_description import crud_job_description
from ...crud.crud_parsed_job_description import crud_parsed_job_description
from ...crud.crud_users import crud_users
from ...schemas.common import CommonResponse
from ...schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionCreateInternal,
    JobDescriptionRead,
    JobDescriptionUpdate,
)
from ...schemas.parsed_job_description import ParsedJobDescriptionCreateInternal
from ...schemas.user import UserRead
from ...services.job_description.workflow import (
    extract_job_description_skills,
    extract_job_description_text,
)
from ..dependencies import get_current_user

router = fastapi.APIRouter(tags=["job_description"])


async def combined_workflow(
    job_description: JobDescriptionRead,
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> None:
    # Extract the PDF text with pdfplumber
    logging.info(f"Extracting text from PDF {job_description.s3_url}")
    text = await extract_job_description_text(
        job_description=job_description,
    )

    # Update the job_description
    job_update = JobDescriptionUpdate(description=text)
    await crud_job_description.update(
        db=db,
        object=job_update,
        id=job_description.id,
    )

    # Extract the job description skills
    logging.info(f"Processing job description with id {job_description.id}")
    job_skills = await extract_job_description_skills(
        job_description,
    )
    logging.info(f"Parsed skills: {job_skills.model_dump()}")

    # Save the parsed skills into a new model
    parsed_job_description = await crud_parsed_job_description.create(
        db=db,
        object=ParsedJobDescriptionCreateInternal(
            job_description_id=job_description.id,
            parsed_skills=job_skills.model_dump(),
            created_by_user_id=job_description.created_by_user_id,
        ),
    )
    logging.info(f"Saved parsed job description with id {parsed_job_description.id}")


@router.post("/{username}/job_description", response_model=JobDescriptionRead, status_code=status.HTTP_201_CREATED)
async def create_job_description(
    request: Request,
    background_tasks: BackgroundTasks,
    username: str,
    job_description: JobDescriptionCreate,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> JobDescriptionRead:
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()
    
    # If both description and pdf are provided, error: "message not both should be provided"
    if job_description.description != None and job_description.pdf_file != None:
        raise fastapi.HTTPException(
            status_code=400,
            detail="Both description and pdf should not be provided",
        )
    
    # If description is null and pdf is null, error: "You must to provide the description or the pdf"
    if job_description.description == None and job_description.pdf_file == None:
        raise fastapi.HTTPException(
            status_code=400,
            detail="You must to provide the description or the pdf",
        )

    job_description_internal_dict = job_description.model_dump()
    job_description_internal_dict["created_by_user_id"] = db_user["id"]

    # If description is provided and pdf is None, create job descripiton with description
    if job_description.description and job_description.pdf_file == None:
        job_description_internal = JobDescriptionCreateInternal(**job_description_internal_dict)
        created_job_description = await crud_job_description.create(db=db, object=job_description_internal)
        return created_job_description

    # If pdf is provided, save the pdf and create job description only with name, then trigger
    # PDF extraction to get the description
    if (
        job_description.pdf_file
        and not isinstance(job_description.pdf_file, str)
        and job_description.description == None
    ):
        s3_url = await upload_s3_file(job_description.pdf_file, f"{str(uuid.uuid4())}.pdf", "job_descriptions")
        job_description_internal_dict["s3_url"] = s3_url
        job_description_internal = JobDescriptionCreateInternal(**job_description_internal_dict)
        created_job_description: JobDescriptionRead = await crud_job_description.create(
            db=db, object=job_description_internal
        )
        background_tasks.add_task(combined_workflow, job_description=created_job_description, db=db)
        return created_job_description

    # If you already have the text from the job description
    if job_description is not None:
        background_tasks.add_task(
            extract_job_description_skills,
            job_description=job_description,
            db=db,
        )

    return created_job_description


@router.get("/{username}/job_description/{id}", response_model=JobDescriptionRead, status_code=status.HTTP_200_OK)
@cache(key_prefix="{username}_job_description_cache", resource_id_name="id")
async def read_job_description(
    request: Request, username: str, id: int, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> dict:
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    db_job_description: JobDescriptionRead | None = await crud_job_description.get(
        db=db, schema_to_select=JobDescriptionRead, id=id, created_by_user_id=db_user["id"], is_deleted=False
    )
    if db_job_description is None:
        raise NotFoundException("Job description not found")

    return db_job_description


@router.get(
    "/{username}/job_descriptions",
    response_model=PaginatedListResponse[JobDescriptionRead],
    status_code=status.HTTP_200_OK,
)
@cache(
    key_prefix="{username}_job_descriptions:page_{page}:items_per_page:{items_per_page}",
    resource_id_name="username",
    expiration=60,
)
async def read_job_descriptions(
    request: Request,
    username: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    page: int = 1,
    items_per_page: int = 20,
) -> dict:
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if not db_user:
        raise NotFoundException("User not found")

    job_description_data = await crud_job_description.get_multi(
        db=db,
        offset=compute_offset(page, items_per_page),
        limit=items_per_page,
        schema_to_select=JobDescriptionRead,
        created_by_user_id=db_user["id"],
        is_deleted=False,
    )

    return paginated_response(crud_data=job_description_data, page=page, items_per_page=items_per_page)


@router.patch("/{username}/job_description/{id}", response_model=CommonResponse, status_code=status.HTTP_200_OK)
@cache(
    "{username}_job_description_cache",
    resource_id_name="id",
    pattern_to_invalidate_extra=["{username}_job_descriptions:*"],
)
async def patch_job_description(
    request: Request,
    username: str,
    id: int,
    values: JobDescriptionUpdate,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> CommonResponse:
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    db_job_description = await crud_job_description.get(
        db=db, schema_to_select=JobDescriptionRead, id=id, is_deleted=False
    )
    if db_job_description is None:
        raise NotFoundException("Job description not found")

    await crud_job_description.update(db=db, object=values, id=id)
    return CommonResponse(status=settings.STATUS_SUCCESS, message="Job description updated")


# Note: this is a soft delete (i.e. putting the is_deleted to true
@router.delete("/{username}/job_description/{id}", response_model=CommonResponse, status_code=status.HTTP_200_OK)
@cache(
    "{username}_job_description_cache",
    resource_id_name="id",
    to_invalidate_extra={"{username}_job_descriptions": "{username}"},
)
async def erase_job_description(
    request: Request,
    username: str,
    id: int,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> CommonResponse:
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    db_job_description = await crud_job_description.get(
        db=db, schema_to_select=JobDescriptionRead, id=id, is_deleted=False
    )
    if db_job_description is None:
        raise NotFoundException("Job description not found")

    await crud_job_description.delete(db=db, db_row=db_job_description, id=id)

    return CommonResponse(status=settings.STATUS_SUCCESS, message="Job description deleted")


@router.get("/{username}/{job_description_id}/process", response_model=CommonResponse, status_code=status.HTTP_200_OK)
async def process_job_description(
    username: str,
    id: int,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    background_tasks: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> CommonResponse:
    """Process a job description.

    :param job_description_id: ID of the job description to process.
    :param job_description_dao: DAO for Job Descriptions models.
    :param parsed_job_description_dao: DAO for ParsedJobDescription models.
    :return: Confirmation of processing.
    :raises HTTPException: If the job description is not found.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    db_job_description = await crud_job_description.get(
        db=db, schema_to_select=JobDescriptionRead, id=id, is_deleted=False
    )
    if db_job_description is None:
        raise NotFoundException("Job description not found")

    background_tasks.add_task(
        extract_job_description_skills,
        db_job_description,
    )
    return CommonResponse(status=settings.STATUS_SUCCESS, message="Job description began processing successfully.")
