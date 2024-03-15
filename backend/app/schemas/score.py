from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class ScoreBase(BaseModel):
    score: Annotated[float, Field(min_length=1, max_length=10, examples=[95.00])]
    resume_id: Annotated[int | None, Field(min_length=1, max_length=100, examples=[1], default=None)]
    job_id: Annotated[int | None, Field(min_length=1, max_length=100, examples=[1], default=None)]
    parsed_job_id: Annotated[int | None, Field(min_length=1, max_length=100, examples=[1], default=None)]


class Score(TimestampSchema, ScoreBase, UUIDSchema, PersistentDeletion):
    pass


class ScoreRead(BaseModel):
    id: int
    created_by_user_id: int
    created_at: datetime


class ScoreCreate(ScoreBase):
    model_config = ConfigDict(extra="forbid")


class ScoreCreateInternal(ScoreCreate):
    created_by_user_id: int


class ScoreUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    score: Annotated[float, Field(min_length=1, max_length=10, examples=[95.00])]
    resume_id: Annotated[int | None, Field(min_length=1, max_length=100, examples=[1], default=None)]
    parsed_job_id: Annotated[int | None, Field(min_length=1, max_length=100, examples=[1], default=None)]


class ScoreUpdateInternal(ScoreUpdate):
    updated_at: datetime


class ScoreDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
