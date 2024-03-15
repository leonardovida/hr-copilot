from pydantic import BaseModel

from ..core.config import settings


class CommonResponse(BaseModel):
    status: str
    message: str

    class Config:
        schema_extra = {
            "example": {
                "status": settings.STATUS_SUCCESS,
                "message": "Operation successful",
            }
        }
