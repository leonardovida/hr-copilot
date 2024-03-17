from typing import Annotated

import fastapi
from fastapi import Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.dependencies import get_current_user
from ...core.config import settings
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ...core.utils.cache import cache
from ...crud.crud_parsed_resume import crud_parsed_resume
from ...crud.crud_users import crud_users
from ...schemas.common import CommonResponse
from ...schemas.parsed_resume import ParsedResumeRead
from ...schemas.user import UserRead

router = fastapi.APIRouter(tags=["parsed_resume"])


@router.get("/{username}/parsed_resume/{id}", response_model=ParsedResumeRead, status_code=status.HTTP_200_OK)
@cache(key_prefix="{username}_parsed_resume_cache", resource_id_name="id")
async def read_parsed_resume(
    request: Request, username: str, id: int, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> ParsedResumeRead:
    """Get the text for a given image ID.

    :param resume_id: ID of the image to retrieve text for.
    :param parsed_resume_dao: The ParsedResumeDAO object to use for database operations.
    :return: TextDTO of the retrieved text.
    :raises HTTPException: If the text is not found.
    """
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    db_parsed_resume: ParsedResumeRead | None = await crud_parsed_resume.get(
        db=db, schema_to_select=ParsedResumeRead, id=id, created_by_user_id=db_user["id"], is_deleted=False
    )
    if db_parsed_resume is None:
        raise NotFoundException("Parsed resume not found")

    return db_parsed_resume


# Note: this is a soft delete (i.e. putting the is_deleted to true
@router.delete("/{username}/parsed_resume/{id}", response_model=CommonResponse, status_code=status.HTTP_200_OK)
@cache(
    "{username}_parsed_resume_cache",
    resource_id_name="id",
    to_invalidate_extra={"{username}_parsed_resumes": "{username}"},
)
async def erase_parsed_resume(
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

    db_job_description = await crud_parsed_resume.get(db=db, schema_to_select=ParsedResumeRead, id=id, is_deleted=False)
    if db_job_description is None:
        raise NotFoundException("Job description not found")

    await crud_parsed_resume.delete(db=db, db_row=db_job_description, id=id)

    return CommonResponse(status=settings.STATUS_SUCCESS, message="Parsed resume deleted")
