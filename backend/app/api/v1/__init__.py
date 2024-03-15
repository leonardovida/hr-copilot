from fastapi import APIRouter

from .feedback import router as feedback_router
from .job_description import router as job_description_router
from .login import router as login_router
from .logout import router as logout_router
from .monitoring import router as monitoring_router
from .parsed_job_description import router as parsed_job_description_router
from .parsed_resume import router as parsed_resume_router
from .posts import router as posts_router
from .rate_limits import router as rate_limits_router
from .resume import router as resume_router
from .scores import router as scores_router
from .tasks import router as tasks_router
from .tiers import router as tiers_router
from .users import router as users_router

router = APIRouter(prefix="/v1")
router.include_router(login_router)
router.include_router(logout_router)
router.include_router(users_router)
router.include_router(posts_router)
router.include_router(tasks_router)
router.include_router(tiers_router)
router.include_router(rate_limits_router)
router.include_router(feedback_router)
router.include_router(job_description_router)
router.include_router(monitoring_router)
router.include_router(parsed_job_description_router)
router.include_router(parsed_resume_router)
router.include_router(scores_router)
router.include_router(resume_router)
