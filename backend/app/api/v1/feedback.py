import uuid
from typing import Annotated

import fastapi
from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ...core.logger import logging
from ...core.utils.s3 import upload_s3_file
from ...crud.crud_feedback import crud_feedback
from ...crud.crud_users import crud_users
from ...schemas.feedback import FeedbackCreate, FeedbackCreateInternal, FeedbackRead
from ...schemas.user import UserRead
from ..dependencies import get_current_user

router = fastapi.APIRouter(tags=["feedbacks"])


@router.post("/{username}/feedback", response_model=FeedbackRead, status_code=201)
async def write_feedback(
    request: Request,
    username: str,
    feedback: FeedbackCreate,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> FeedbackRead:
    db_user: UserRead = await crud_users.get(db=db, schema_to_select=UserRead, username=username, is_deleted=False)
    if db_user is None:
        raise NotFoundException("User not found")

    if current_user["id"] != db_user["id"]:
        raise ForbiddenException()

    # Upload the PDF and create the resume entry
    s3_url = None
    if feedback.pdf_file:
        if feedback.pdf_file.size is not None and feedback.pdf_file.size > 30 * 1024 * 1024:
            raise HTTPException(
                status_code=400, detail="The PDF uploaded is too large, please resize it and try again."
            )
        file_name = str(uuid.uuid4())
        s3_url = await upload_s3_file(
            file=feedback.pdf_file,
            file_name=f"{file_name}.pdf",
            folder_path=f"feedback/{username}",  # we create a new path for each user
        )

    feedback_internal_dict = feedback.model_dump()
    feedback_internal_dict.pop("pdf_file", None)  # removing the key as we already saved it to s3
    feedback_internal_dict["created_by_user_id"] = db_user["id"]
    feedback_internal_dict["s3_url"] = s3_url

    logging.debug(f"feedback_internal_dict: {feedback_internal_dict}")

    feedback_internal = FeedbackCreateInternal(**feedback_internal_dict)
    logging.info(feedback_internal)
    created_feedback: FeedbackRead = await crud_feedback.create(db=db, object=feedback_internal)
    return created_feedback
