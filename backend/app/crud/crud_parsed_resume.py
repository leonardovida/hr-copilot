from fastcrud import FastCRUD

from ..models.parsed_resume import ParsedResume
from ..schemas.parsed_resume import (
    ParsedResumeCreate,
    ParsedResumeDelete,
    ParsedResumeUpdate,
    ParsedResumeUpdateInternal,
)

CRUDParsedResume = FastCRUD[
    ParsedResume, ParsedResumeCreate, ParsedResumeUpdate, ParsedResumeUpdateInternal, ParsedResumeDelete
]
crud_parsed_resume = CRUDParsedResume(ParsedResume)
