from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from datetime import datetime
from db import Base

class Solve(Base):
    __tablename__ = "solves"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    time = Column(Float, nullable=False)
    scramble = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    note = Column(String, nullable=True)
    status = Column(Enum("ok", "+2", "DNF"), default="ok", nullable=False)
