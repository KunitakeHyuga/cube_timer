from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SolveBase(BaseModel):
    time: float
    scramble: str
    note: Optional[str] = None
    status: Optional[str] = "ok"

class SolveCreate(SolveBase):
    pass

class SolveUpdate(SolveBase):
    pass

class SolveResponse(SolveBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
