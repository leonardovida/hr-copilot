import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.dependencies import get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ...core.utils.cache import cache
from ...crud.crud_parsed_job_description import crud_parsed_job_description
from ...crud.crud_parsed_resume import crud_parsed_resume
from ...crud.crud_scores import crud_scores
from ...crud.crud_users import crud_users
from ...schemas.parsed_job_description import ParsedJobDescriptionRead
from ...schemas.parsed_resume import ParsedResumeRead
from ...schemas.score import ScoreCreate, ScoreCreateInternal, ScoreRead
from ...schemas.user import UserRead
from ...services.scorer.calculation import score_calculation

router = APIRouter(tags=["scores"])


@router.get("/ranking/{username}/{job_id}", response_model=ScoreRead, status_code=status.HTTP_200_OK)
async def get_score_ranking(
    request: Request,
    username: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    job_id: int,
):
    """Get Score ranking.

    :param job_description_id: ID of the job description
    :param score_dao: The ScoreDAO object to use for database operations.
    :return: ScoreRankingModelDTO of the retrieved score ranking.
    :raises HTTPException: If the score is not found.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    logging.info(f"Getting all scores for username: {username}, job_id: {job_id}")
    response = await crud_scores.get_multi(
        db=db, job_id=job_id, offset=0, limit=30, sort_columns=["score"], sort_orders=["desc"]
    )

    if response is None:
        raise HTTPException(status_code=404, detail="Score not found")

    return response


@router.post("/{username}/{resume_id}/{job_id}", response_model=ScoreRead, status_code=status.HTTP_200_OK)
async def create_score(
    request: Request,
    username: str,
    score: ScoreCreate,
    resume_id: int,
    job_id: int,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> ScoreRead:
    """Create a new Score.

    :param resume_id: ID of the pdf.
    :param job_description_id: ID of the job description
    :param score_dao: The ScoreDAO object to use for database operations.
    :param parsed_resume_dao: The ParsedResumeDAO object to use for database operations.
    :param parsed_job_description_dao: The ParsedJobDescriptionDAO object to use for database operations.
    :return: ScoreModelDTO of the retrieved score.
    :raises HTTPException: If the score is not found.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    score_internal_dict = score.model_dump()
    score_internal_dict["created_by_user_id"] = db_user["id"]

    # post_internal = PostCreateInternal(**post_internal_dict)
    # created_post: PostRead = await crud_posts.create(db=db, object=post_internal)
    # return created_post

    parsed_text_result: ParsedResumeRead = await crud_parsed_resume.get(
        db=db, schema_to_select=ParsedResumeRead, job_description_id=int(job_id), id=int(resume_id)
    )
    parsed_job_description: ParsedJobDescriptionRead = await crud_parsed_job_description.get(
        db=db, schema_to_select=ParsedJobDescriptionRead, job_description_id=int(job_id)
    )

    score_result = await score_calculation(parsed_resume=parsed_text_result)
    return await crud_scores.create(
        db=db,
        object=ScoreCreateInternal(
            score=score_result["score"],
            resume_id=int(resume_id),
            job_id=int(job_id),
            parsed_job_id=parsed_job_description.id,
            created_by_user_id=db_user["id"],
        ),
    )


@router.get("/{username}/{resume_id}/{job_id}", response_model=ScoreRead, status_code=status.HTTP_200_OK)
@cache(key_prefix="{username}_score_cache", resource_id_name="id")
async def read_score(
    request: Request,
    username: str,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    resume_id: int,
    job_id: int,
) -> ScoreRead:
    """Get last Score.

    :param resume_id: ID of the pdf.
    :param job_description_id: ID of the job description
    :param score_dao: The ScoreDAO object to use for database operations.
    :return: ScoreModelDTO of the retrieved score.
    :raises HTTPException: If the score is not found.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    # Get lastest score for a combination of resume/job
    response = await crud_scores.get(
        db=db,
        schema_to_select=ScoreRead,
        resume_id=resume_id,
        job_id=job_id,
        sort_columns="created_at",
        sort_orders="desc",
        limit=1,
    )

    if response is None:
        raise HTTPException(status_code=404, detail="Score not found")

    return response
