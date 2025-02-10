from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://user:password@back_db/cube_solver"

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# DB セッション取得関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
