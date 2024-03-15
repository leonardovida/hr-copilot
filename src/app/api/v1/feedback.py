from typing import Annotated

import fastapi
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ...crud.crud_feedback import crud_feedback
from ...crud.crud_users import crud_users
from ...schemas.feedback import FeedbackCreate, FeedbackCreateInternal, FeedbackRead
from ...schemas.user import UserRead
from ..dependencies import get_current_user

router = fastapi.APIRouter(tags=["feedback"])


@router.post("/{username}/feedback", response_model=FeedbackRead, status_code=201)
async def write_feedback(
    request: Request,
    username: str,
    feedback: FeedbackCreate,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> FeedbackRead:
    db_user = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    feedback_internal_dict = feedback.model_dump()
    feedback_internal_dict["created_by_user_id"] = db_user["id"]

    feedback_internal = FeedbackCreateInternal(**feedback_internal_dict)
    created_feedback: FeedbackRead = await crud_feedback.create(db=db, object=feedback_internal)
    return created_feedback
