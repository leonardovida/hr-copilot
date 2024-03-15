from fastcrud import FastCRUD

from ..models.parsed_job_description import ParsedJobDescription
from ..schemas.parsed_job_description import (
    ParsedJobDescriptionCreate,
    ParsedJobDescriptionDelete,
    ParsedJobDescriptionUpdate,
    ParsedJobDescriptionUpdateInternal,
)

CRUDParsedJobDescription = FastCRUD[
    ParsedJobDescription,
    ParsedJobDescriptionCreate,
    ParsedJobDescriptionUpdate,
    ParsedJobDescriptionUpdateInternal,
    ParsedJobDescriptionDelete,
]
crud_parsed_job_description = CRUDParsedJobDescription(ParsedJobDescription)
