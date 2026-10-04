"""Pytest configuration and shared fixtures.

Provides a test database (SQLite in-memory) and test client
that all tests can use without needing PostgreSQL.
"""

import os

# Set test environment BEFORE importing app modules
os.environ["DATABASE_URL"] = "sqlite:///./test_tracex.db"
os.environ["APP_ENV"] = "development"
os.environ["LOG_LEVEL"] = "DEBUG"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app

# Test database setup
TEST_DATABASE_URL = "sqlite:///./test_tracex.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


def override_get_db():
    """Override the database dependency for tests."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the database dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """Provide a database session for direct DB tests."""
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """Provide a FastAPI test client."""
    return TestClient(app)
