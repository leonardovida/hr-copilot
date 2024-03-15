from fastcrud import FastCRUD

from ..models.resume import Resume
from ..schemas.resume import ResumeCreate, ResumeDelete, ResumeUpdate, ResumeUpdateInternal

CRUDResume = FastCRUD[Resume, ResumeCreate, ResumeUpdate, ResumeUpdateInternal, ResumeDelete]
crud_resume = CRUDResume(Resume)
