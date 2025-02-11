from fastapi import FastAPI
from fastapi.responses import JSONResponse, Response
from typing import List  # ネストされたBodyを定義するために必要
from generate_scramble import generate_scramble
from generate_visual import generate_visual
import genetate_graphs as genetate_graphs
from starlette.middleware.cors import CORSMiddleware  # CORSを回避するために必要
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db, engine, Base
import crud, model, schemas
import matplotlib.pyplot as plt
import io
import base64

app = FastAPI()

# CORSを回避するために設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------APIの実装------------

@app.get("/")
def read_root():
    return {"Hello": "World!!!!"}

@app.get("/scramble")
def get_scramble():
    return generate_scramble()

@app.get("/visual")
def get_visual():
    scramble = generate_scramble()
    visual = generate_visual(scramble)
    
    # 1つの JSON に統合
    response_data = {
        "scramble": scramble["scramble"],
        "visual": visual
    }

    return JSONResponse(content=response_data)

############################################################

# データベースの作成（初回のみ）
Base.metadata.create_all(bind=engine)

# **1. ソルブ詳細取得**
@app.get("/solves/{id}", response_model=schemas.SolveResponse)
def read_solve(id: int, db: Session = Depends(get_db)):
    db_solve = crud.get_solve(db, id)
    if db_solve is None:
        raise HTTPException(status_code=404, detail="Solve not found")
    return db_solve

# **2. ソルブ一覧取得**
@app.get("/solves", response_model=List[schemas.SolveResponse])
def read_solves(db: Session = Depends(get_db)):
    return crud.get_solves(db)

# **3. ソルブ作成**
@app.post("/solves", response_model=schemas.SolveResponse)
def create_solve(solve: schemas.SolveCreate, db: Session = Depends(get_db)):
    return crud.create_solve(db, solve)

# **4. ソルブ詳細変更**
@app.put("/solves/{id}", response_model=schemas.SolveResponse)
def update_solve(id: int, solve: schemas.SolveUpdate, db: Session = Depends(get_db)):
    db_solve = crud.update_solve(db, id, solve)
    if db_solve is None:
        raise HTTPException(status_code=404, detail="Solve not found")
    return db_solve

# **5. ソルブ削除**
@app.delete("/solves/{id}", response_model=schemas.SolveResponse)
def delete_solve(id: int, db: Session = Depends(get_db)):
    db_solve = crud.delete_solve(db, id)
    if db_solve is None:
        raise HTTPException(status_code=404, detail="Solve not found")
    return db_solve

@app.get("/graph/linegraph")
def get_linegraph(db: Session = Depends(get_db)):
    return genetate_graphs.get_linegraph(db)

@app.get("/graph/histogram")
def get_histogram(db: Session = Depends(get_db)):
    return genetate_graphs.get_histogram(db)

@app.get("/graph/boxplot")
def get_boxplot(db: Session = Depends(get_db)):
    return genetate_graphs.get_boxplot(db)

@app.get("/graph/moving_average")
def get_moving_average(db: Session = Depends(get_db)):
    return genetate_graphs.get_moving_average(db)

@app.get("/graph/scatterplot")
def get_scatterplot(db: Session = Depends(get_db)):
    return genetate_graphs.get_scatterplot(db)

@app.get("/graph/statistics")
def get_statistics(db: Session = Depends(get_db)):
    return genetate_graphs.get_statistics(db)

@app.get("/graph/top_bottom_times")
def get_top_bottom_times(db: Session = Depends(get_db)):
    return genetate_graphs.get_top_bottom_times(db)