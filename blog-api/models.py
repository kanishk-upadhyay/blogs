from datetime import datetime, timezone
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from database import db


class User(UserMixin, db.Model):
    """
    User model for authentication.
    
    Fields:
    - id: Primary key
    - username: Unique username for login
    - password_hash: Bcrypt hashed password
    - is_active: Account status flag
    - created_at: Account creation timestamp
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationship to posts
    posts = db.relationship("Post", backref="author", lazy="dynamic")

    def set_password(self, password: str) -> None:
        """Hash and store password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify password against hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_session_info: bool = False) -> dict:
        """Serialize user for API responses (exclude password_hash!)."""
        data = {
            "id": self.id,
            "username": self.username,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        
        # Include session expiration if requested (for authenticated responses)
        if include_session_info:
            from flask import session, current_app
            from datetime import timedelta
            
            # Calculate session expiration based on permanent session lifetime
            if session.permanent:
                lifetime = current_app.config.get('PERMANENT_SESSION_LIFETIME')
                if lifetime:
                    expires = datetime.now(timezone.utc) + lifetime
                    data["session_expires"] = expires.isoformat()
        
        return data


class Post(db.Model):
    """
    Blog post entity storing markdown content and metadata.

    Fields:
    - id: Primary key
    - title: Post title
    - slug: URL-friendly unique identifier
    - excerpt: Optional short summary
    - content: Full markdown content
    - published: Visibility flag
    - published_at: Timestamp when published
    - created_at: Creation timestamp
    - updated_at: Last update timestamp (auto-updated)
    - author_id: Foreign key to User (nullable for legacy posts)
    """

    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    excerpt = db.Column(db.Text)
    content = db.Column(db.Text, nullable=False)
    published = db.Column(db.Boolean, default=False, nullable=False)
    published_at = db.Column(db.DateTime)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    
    # Foreign key to User (nullable for backward compatibility with existing posts)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    def to_dict(self, include_author: bool = True) -> dict:
        """
        Serialize post for API responses.
        
        Args:
            include_author: Whether to include author information
        """
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "content": self.content,
            "published": self.published,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        
        # Include author info if requested and author exists
        if include_author and self.author:
            data["author"] = {
                "id": self.author.id,
                "username": self.author.username,
            }
        else:
            data["author"] = None
        
        return data
