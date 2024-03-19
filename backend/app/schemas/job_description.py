from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field
from fastapi import UploadFile


from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class JobDescriptionBase(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=2000, examples=["This is my job description title"])]
    description: Annotated[
        str | None,
        Field(min_length=1, max_length=63206, examples=["This is the content of my job description."], default=None),
    ]


class JobDescription(TimestampSchema, JobDescriptionBase, UUIDSchema, PersistentDeletion):
    pass


class JobDescriptionRead(BaseModel):
    id: int
    title: Annotated[str, Field(min_length=1, max_length=2000, examples=["This is my job description title"])]
    description: Annotated[
        str | None,
        Field(min_length=1, max_length=63206, examples=["This is the content of my job description."], default=None),
    ]
    s3_url: Annotated[
        str | None,
        Field(examples=["https://s3.exampleurl.com"], default=None),
    ]
    created_by_user_id: int
    created_at: datetime


class JobDescriptionCreate(JobDescriptionBase):
    pdf_file: UploadFile|None
    s3_url: Annotated[
        str | None,
        Field(pattern=r"^(https?|ftp)://[^\s/$.?#].[^\s]*$", examples=["s3.exampleurl.com"], default=None),
    ]
    model_config = ConfigDict(extra="forbid")


class JobDescriptionCreateInternal(JobDescriptionCreate):
    created_by_user_id: int


class JobDescriptionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Annotated[
        str | None,
        Field(min_length=1, max_length=2000, examples=["This is my updated job description title"], default=None),
    ]
    description: Annotated[
        str | None,
        Field(
            min_length=1,
            max_length=63206,
            examples=["This is the updated content of my job description."],
            default=None,
        ),
    ]
    s3_url: Annotated[
        str | None,
        Field(pattern=r"^(https?|ftp)://[^\s/$.?#].[^\s]*$", examples=["https://www.exampleurl.com"], default=None),
    ]


class JobDescriptionUpdateInternal(JobDescriptionUpdate):
    updated_at: datetime


class JobDescriptionDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
