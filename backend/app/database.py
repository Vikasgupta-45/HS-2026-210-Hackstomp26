import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DEFAULT_SQLITE_URL = "sqlite:///./health_sync.db"
raw_db_url = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL).strip()

# Some platforms expose old postgres:// URLs; SQLAlchemy expects postgresql://
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URL = raw_db_url

is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")
engine_kwargs = {"pool_pre_ping": True}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
