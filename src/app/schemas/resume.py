from datetime import datetime
from typing import Annotated

from fastapi import UploadFile
from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class ResumeBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=2000, examples=["John Doe Resume"])]
    job_id: int
    text: Annotated[
        str | None, Field(min_length=1, max_length=63206, examples=["This is the resume content."], default=None)
    ]
    s3_url: Annotated[
        str | None,
        Field(
            pattern=r"^(https?|ftp)://[^\s/$.?#].[^\s]*$", examples=["https://www.example.com/resume.pdf"], default=None
        ),
    ]


class Resume(TimestampSchema, ResumeBase, UUIDSchema, PersistentDeletion):
    pass


class ResumeRead(BaseModel):
    id: int
    name: Annotated[str, Field(min_length=1, max_length=2000, examples=["John Doe Resume"])]
    job_id: int
    text: Annotated[
        str | None, Field(min_length=1, max_length=63206, examples=["This is the resume content."], default=None)
    ]
    s3_url: Annotated[
        str | None,
        Field(examples=["https://www.example.com/resume.pdf"], default=None),
    ]
    created_by_user_id: int
    created_at: datetime


class ResumeCreate(ResumeBase):
    pdf_file: UploadFile | None
    model_config = ConfigDict(extra="forbid")


class ResumeCreateInternal(ResumeCreate):
    created_by_user_id: int


class ResumeUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Annotated[
        str | None, Field(min_length=1, max_length=2000, examples=["Updated John Doe Resume"], default=None)
    ]
    text: Annotated[
        str | None,
        Field(min_length=1, max_length=63206, examples=["This is the updated resume content."], default=None),
    ]
    s3_url: Annotated[
        str | None,
        Field(
            pattern=r"^(https?|ftp)://[^\s/$.?#].[^\s]*$",
            examples=["https://www.example.com/updated_resume.pdf"],
            default=None,
        ),
    ]


class ResumeUpdateInternal(ResumeUpdate):
    updated_at: datetime


class ResumeDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
