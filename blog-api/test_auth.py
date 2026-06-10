import pytest
from app import create_app
from database import db

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_register_valid_input(client):
    response = client.post("/api/auth/register", json={
        "username": "testuser_valid",
        "password": "password123"
    })

    if response.status_code != 201:
        print(response.get_json())

    assert response.status_code == 201
    data = response.get_json()
    assert data["username"] == "testuser_valid"

def test_register_username_too_long(client):
    response = client.post("/api/auth/register", json={
        "username": "a" * 81,
        "password": "password123"
    })
    assert response.status_code == 400
    data = response.get_json()
    assert "Username must be at most 80 characters" in data["error"]

def test_register_password_too_long(client):
    response = client.post("/api/auth/register", json={
        "username": "testuser2",
        "password": "p" * 129
    })
    assert response.status_code == 400
    data = response.get_json()
    assert "Password must be at most 128 characters" in data["error"]
