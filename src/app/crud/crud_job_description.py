from fastcrud import FastCRUD

from ..models.job_description import JobDescription
from ..schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionDelete,
    JobDescriptionUpdate,
    JobDescriptionUpdateInternal,
)

CRUDJobDescription = FastCRUD[
    JobDescription, JobDescriptionCreate, JobDescriptionUpdate, JobDescriptionUpdateInternal, JobDescriptionDelete
]
crud_job_description = CRUDJobDescription(JobDescription)
