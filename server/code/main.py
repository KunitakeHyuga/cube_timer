from fastapi import FastAPI
from typing import List  # ネストされたBodyを定義するために必要
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
