from sqlalchemy.orm import Session
from model import Solve
from schemas import SolveCreate, SolveUpdate
from datetime import timezone, timedelta

def to_jst(utc_dt):
    """UTC の datetime を JST に変換"""
    if utc_dt is not None:
        return utc_dt.replace(tzinfo=timezone.utc).astimezone(timezone(timedelta(hours=9)))
    return None

def get_solve(db: Session, solve_id: int):
    solve = db.query(Solve).filter(Solve.id == solve_id).first()
    if solve:
        solve.created_at = to_jst(solve.created_at)  # JST に変換
    return solve

def get_solves(db: Session):
    solves = db.query(Solve).all()
    for solve in solves:
        solve.created_at = to_jst(solve.created_at)  # JST に変換
    return solves

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
