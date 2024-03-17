import logging
import os

from fastapi import APIRouter, status
from fastapi.exceptions import HTTPException

from ...core.config import settings
from ...schemas.common import CommonResponse
from ...schemas.monitoring import CPUCount

router = APIRouter(tags=["monitoring"])


@router.get("/health", response_model=CommonResponse, status_code=status.HTTP_200_OK)
def health_check() -> CommonResponse:
    """Checks the health of a project and returns a JSON indicating the status.

    Returns:
        dict: A dictionary with the health status of the project.
    """
    try:
        # TODO: check whether connection to db and redis is working
        return CommonResponse(status=settings.STATUS_SUCCESS, message="Services are healthy")
    except Exception as e:
        logging.debug(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")


@router.get("/cpus/", response_model=CPUCount, status_code=status.HTTP_200_OK)
async def get_cpu_count() -> CPUCount:
    """Get the CPU count.

    Returns:
        CPUCount: A model representing the CPU count.
    """
    try:
        cpu_count = os.cpu_count()
        if cpu_count is None:
            logging.debug("Failed to retrieve CPU count.")
            raise HTTPException(status_code=500, detail="Could not retrieve CPU count.")
        return CPUCount(cpus=cpu_count)
    except Exception as e:
        logging.debug(f"Error retrieving CPU count: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while retrieving CPU count.")
