from pydantic import BaseModel


class CPUCount(BaseModel):
    cpus: int
