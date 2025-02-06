from fastapi import FastAPI
from fastapi.responses import JSONResponse
from typing import List  # ネストされたBodyを定義するために必要
from generate_scramble import generate_scramble
from generate_visual import generate_visual
from starlette.middleware.cors import CORSMiddleware  # CORSを回避するために必要
from db import session  # DBと接続するためのセッション
from model import UserTable, User  # 今回使うモデルをインポート

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

# テーブルにいる全ユーザ情報を取得 GET
@app.get("/users")
def read_users():
    users = session.query(UserTable).all()
    return users

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

@app.get("/array")
def get_array():
    array1 = [[1,2,3],[4,5,6],[7,8,9]]
    return {"array" : array1}