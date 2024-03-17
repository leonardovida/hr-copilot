from pydantic import BaseModel

from ..core.config import settings


class CommonResponse(BaseModel):
    status: str
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "status": settings.STATUS_SUCCESS,
                "message": "Operation successful",
            }
        }
