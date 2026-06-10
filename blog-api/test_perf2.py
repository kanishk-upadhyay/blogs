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
        # We need to make sure we don't recreate existing stuff if the app context is reused
        User.query.delete()
        Post.query.delete()
        db.session.commit()

        user = User(username="user_0")
        user.set_password("password")
        db.session.add(user)
        db.session.commit()

        for j in range(5):
            post = Post(
                title=f"Title 0_{j}",
                slug=f"slug-0-{j}",
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


def test_query_count(client, app):
    from sqlalchemy import event

    query_count = 0
    queries = []

    def before_cursor_execute(
        conn, cursor, statement, parameters, context, executemany
    ):
        nonlocal query_count
        query_count += 1
        queries.append(statement)

    with app.app_context():
        event.listen(db.engine, "before_cursor_execute", before_cursor_execute)

        # Now count queries
        db.session.expunge_all()  # clear session cache
        response = client.get("/api/posts/slug-0-2")

        event.remove(db.engine, "before_cursor_execute", before_cursor_execute)

        assert response.status_code == 200

        print("\n=== QUERIES RECORDED ===")
        print(f"Total number of queries: {query_count}")
        for i, q in enumerate(queries):
            print(f"Query {i+1}: {q}")
