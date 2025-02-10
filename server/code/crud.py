from sqlalchemy.orm import Session
from model import Solve
from schemas import SolveCreate, SolveUpdate

def get_solve(db: Session, solve_id: int):
    return db.query(Solve).filter(Solve.id == solve_id).first()

def get_solves(db: Session):
    return db.query(Solve).all()

def create_solve(db: Session, solve: SolveCreate):
    db_solve = Solve(**solve.dict())
    db.add(db_solve)
    db.commit()
    db.refresh(db_solve)
    return db_solve

def update_solve(db: Session, solve_id: int, solve: SolveUpdate):
    db_solve = db.query(Solve).filter(Solve.id == solve_id).first()
    if db_solve:
        for key, value in solve.dict().items():
            setattr(db_solve, key, value)
        db.commit()
        db.refresh(db_solve)
    return db_solve

def delete_solve(db: Session, solve_id: int):
    db_solve = db.query(Solve).filter(Solve.id == solve_id).first()
    if db_solve:
        db.delete(db_solve)
        db.commit()
    return db_solve
