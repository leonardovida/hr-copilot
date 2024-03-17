from datetime import datetime
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema


class ParsedJobDescriptionBase(BaseModel):
    job_description_id: int
    parsed_skills: dict[str, Any]


class ParsedJobDescription(TimestampSchema, ParsedJobDescriptionBase, PersistentDeletion):
    pass


class ParsedJobDescriptionRead(BaseModel):
    id: int
    job_description_id: int
    parsed_skills: dict[str, Any]
    created_by_user_id: int
    created_at: datetime


class ParsedJobDescriptionCreate(ParsedJobDescriptionBase):
    model_config = ConfigDict(extra="forbid")


class ParsedJobDescriptionCreateInternal(ParsedJobDescriptionCreate):
    created_by_user_id: int


class ParsedJobDescriptionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    parsed_skills: Annotated[dict[str, Any] | None, Field(default=None)]


class ParsedJobDescriptionUpdateInternal(ParsedJobDescriptionUpdate):
    updated_at: datetime


class ParsedJobDescriptionDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
