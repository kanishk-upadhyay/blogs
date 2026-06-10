import pytest
from app import create_app
from database import db
from models import Post, User
import json


@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.create_all()
        # Create some test users and posts
        for i in range(10):
            user = User(username=f"user_{i}")
            user.set_password("password")
            db.session.add(user)
            db.session.commit()

            for j in range(50):
                post = Post(
                    title=f"Title {i}_{j}",
                    slug=f"slug-{i}-{j}",
                    content="Content",
                    author=user,
                    published=True,
                )
                db.session.add(post)
            db.session.commit()

    yield app


@pytest.fixture
def client(app):
    return app.test_client()


def fetch_post(client, slug):
    return client.get(f"/api/posts/{slug}")


def test_benchmark_get_post(benchmark, client):
    # Benchmark fetching a specific post
    slug_to_fetch = "slug-0-25"
    result = benchmark(fetch_post, client, slug_to_fetch)
    assert result.status_code == 200
