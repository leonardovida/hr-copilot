from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import settings
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ...core.utils.cache import cache
from ...crud.crud_parsed_job_description import crud_parsed_job_description
from ...crud.crud_users import crud_users
from ...schemas.common import CommonResponse
from ...schemas.parsed_job_description import (
    ParsedJobDescriptionCreate,
    ParsedJobDescriptionCreateInternal,
    ParsedJobDescriptionRead,
)
from ...schemas.user import UserRead
from ..dependencies import get_current_user

router = APIRouter(tags=["parsed_job_description"])


@router.post(
    "/{username}/parsed_job_description", response_model=ParsedJobDescriptionRead, status_code=status.HTTP_200_OK
)
async def create_parsed_job_description(
    request: Request,
    parsed_job_description: ParsedJobDescriptionCreate,
    username: str,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> ParsedJobDescriptionRead:
    """Create a parsed job description in the database.

    :param job_description_id: ID of the job description.
    :param parsed_skills: A SkillsExtract instance with the job description skills already parsed
    :return: ParsedJobDescriptionDTO instance
    :raises HTTPException: If no job descriptions are found.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    # if empty dict, there was a failure
    if parsed_job_description.parsed_skills == {}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both description and pdf should not be provided",
        )

    # Add user id
    parsed_job_description_internal_dict = parsed_job_description.model_dump()
    parsed_job_description_internal_dict["created_by_user_id"] = db_user["id"]
    parsed_job_description_internal = ParsedJobDescriptionCreateInternal(**parsed_job_description_internal_dict)

    parsed_job_description = await crud_parsed_job_description.create(db=db, object=parsed_job_description_internal)

    return parsed_job_description


@router.get(
    "/{username}/parsed_job_description/{id}", response_model=ParsedJobDescriptionRead, status_code=status.HTTP_200_OK
)
@cache(key_prefix="{username}_parsed_job_description_cache", resource_id_name="id")
async def read_job_description(
    request: Request, username: str, id: int, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> ParsedJobDescriptionRead:
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    db_job_description: ParsedJobDescriptionRead | None = await crud_parsed_job_description.get(
        db=db, schema_to_select=ParsedJobDescriptionRead, id=id, created_by_user_id=db_user["id"], is_deleted=False
    )
    if db_job_description is None:
        raise NotFoundException("Job description not found")

    return db_job_description


# Note: this is a soft delete (i.e. putting the is_deleted to true
@router.delete("/{username}/parsed_job_description/{id}", response_model=CommonResponse, status_code=status.HTTP_200_OK)
@cache(
    "{username}_parsed_job_description_cache",
    resource_id_name="id",
    to_invalidate_extra={"{username}_parsed_job_descriptions": "{username}"},
)
async def erase_parsed_job_description(
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

    db_job_description = await crud_parsed_job_description.get(
        db=db, schema_to_select=ParsedJobDescriptionRead, id=id, is_deleted=False
    )
    if db_job_description is None:
        raise NotFoundException("Job description not found")

    await crud_parsed_job_description.delete(db=db, db_row=db_job_description, id=id)

    return CommonResponse(status=settings.STATUS_SUCCESS, message="Parsed job description deleted")
