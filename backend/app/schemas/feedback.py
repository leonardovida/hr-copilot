from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class FeedbackBase(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=200, examples=["Feedback Title"])]
    description: Annotated[
        str | None, Field(min_length=1, max_length=63206, examples=["This is the feedback content."], default=None)
    ]


class Feedback(TimestampSchema, FeedbackBase, UUIDSchema, PersistentDeletion):
    pass


class FeedbackRead(BaseModel):
    id: int
    title: Annotated[str, Field(min_length=1, max_length=200, examples=["Feedback Title"])]
    description: Annotated[
        str | None, Field(min_length=1, max_length=63206, examples=["This is the feedback content."], default=None)
    ]
    created_at: datetime


class FeedbackCreate(FeedbackBase):
    model_config = ConfigDict(extra="forbid")


class FeedbackCreateInternal(FeedbackCreate):
    created_by_user_id: int


class FeedbackUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Annotated[str | None, Field(min_length=1, max_length=200, examples=["Updated Feedback Title"], default=None)]
    description: Annotated[
        str | None,
        Field(min_length=1, max_length=63206, examples=["This is the updated feedback content."], default=None),
    ]


class FeedbackUpdateInternal(FeedbackUpdate):
    updated_at: datetime


class FeedbackDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
