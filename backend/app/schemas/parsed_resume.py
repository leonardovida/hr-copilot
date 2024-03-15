from datetime import datetime
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class ParsedResumeBase(BaseModel):
    job_description_id: int
    resume_id: int
    parsed_skills: dict[str, Any]


class ParsedResume(TimestampSchema, ParsedResumeBase, UUIDSchema, PersistentDeletion):
    pass


class ParsedResumeRead(BaseModel):
    id: int
    job_description_id: int
    resume_id: int
    parsed_skills: dict[str, Any]
    created_at: datetime


class ParsedResumeCreate(ParsedResumeBase):
    model_config = ConfigDict(extra="forbid")


class ParsedResumeCreateInternal(ParsedResumeCreate):
    created_by_user_id: int


class ParsedResumeUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    parsed_skills: Annotated[dict[str, Any] | None, Field(default=None)]


class ParsedResumeUpdateInternal(ParsedResumeUpdate):
    updated_at: datetime


class ParsedResumeDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
