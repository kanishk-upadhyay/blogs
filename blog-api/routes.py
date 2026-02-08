from datetime import datetime, timezone

from flask import Blueprint, abort, jsonify, request
from flask_login import current_user, login_required
from sqlalchemy import desc

from database import db
from models import Post

api_bp = Blueprint("api", __name__)


def set_published_at(post: Post, published: bool) -> None:
    """
    Helper to manage published_at timestamp based on published status.
    Sets published_at to current time if published and not already set.
    Clears published_at if unpublished.
    """
    if published and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    elif not published:
        post.published_at = None


@api_bp.get("/health")
def health() -> tuple:
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


@api_bp.get("/posts")
def list_posts():
    """
    List posts.
    Query params:
      - published: if not 'false', only return published posts (default true)
    """
    only_published = request.args.get("published") != "false"
    query = Post.query

    if only_published:
        query = query.filter_by(published=True)
    else:
        # Requesting drafts - apply security filter
        if current_user.is_authenticated:
            # Show all published posts AND my own drafts
            query = query.filter((Post.published == True) | (Post.author_id == current_user.id))
        else:
            # Anonymous users can only see published posts, ignore 'published=false'
            query = query.filter_by(published=True)

    posts = query.order_by(desc(Post.published_at), desc(Post.created_at)).all()
    return jsonify([p.to_dict() for p in posts])


@api_bp.get("/posts/<slug>")
def get_post(slug: str):
    """Get a single post by slug."""
    post = Post.query.filter_by(slug=slug).first()
    if not post:
        abort(404, description="Post not found")
    return jsonify(post.to_dict())


@api_bp.post("/posts")
@login_required
def create_post():
    """Create a new post (requires authentication)."""
    data = request.get_json(silent=True) or {}
    required = ["title", "slug", "content"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        abort(400, description=f"Missing fields: {', '.join(missing)}")

    if Post.query.filter_by(slug=data["slug"]).first():
        abort(400, description="Slug already exists")

    post = Post(
        title=data["title"],
        slug=data["slug"],
        content=data["content"],
        excerpt=data.get("excerpt"),
        published=bool(data.get("published", False)),
        author_id=current_user.id,  # Set the author
    )
    # Set published_at if creating as published
    set_published_at(post, post.published)

    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@api_bp.put("/posts/<int:post_id>")
@login_required
def update_post(post_id: int):
    """Update an existing post by id (requires authentication and ownership)."""
    post = Post.query.get_or_404(post_id)
    
    # Check ownership - only author can edit their post
    if post.author_id != current_user.id:
        abort(403, description="Not authorized to edit this post")
    
    data = request.get_json(silent=True) or {}

    # Disallow setting empty required fields
    for field in ["title", "slug", "content"]:
        if field in data and not data[field]:
            abort(400, description=f"Field '{field}' cannot be empty")

    # If slug is changing, check for conflicts
    if "slug" in data and data["slug"] != post.slug:
        if Post.query.filter_by(slug=data["slug"]).first():
            abort(400, description="Slug already exists")

    for field in ["title", "slug", "content", "excerpt", "published"]:
        if field in data:
            setattr(post, field, data[field])

    # Manage published_at based on published flag
    set_published_at(post, post.published)

    db.session.commit()
    return jsonify(post.to_dict())


@api_bp.delete("/posts/<int:post_id>")
@login_required
def delete_post(post_id: int):
    """Delete a post by id (requires authentication and ownership)."""
    post = Post.query.get_or_404(post_id)
    
    # Check ownership - only author can delete their post
    if post.author_id != current_user.id:
        abort(403, description="Not authorized to delete this post")
    
    db.session.delete(post)
    db.session.commit()
    return jsonify({"deleted": True})
