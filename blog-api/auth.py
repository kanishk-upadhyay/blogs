from datetime import datetime, timezone

from flask import Blueprint, abort, jsonify, request, session
from flask_login import current_user, login_required, login_user, logout_user

from database import db
from models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    """Register a new user account."""
    data = request.get_json(silent=True) or {}

    # Validate required fields
    required = ["username", "password"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        abort(400, description=f"Missing fields: {', '.join(missing)}")

    # Validate username uniqueness
    if User.query.filter_by(username=data["username"]).first():
        abort(400, description="Username already exists")

    # Basic validation
    if len(data["password"]) < 8:
        abort(400, description="Password must be at least 8 characters")
    if len(data["password"]) > 128:
        abort(400, description="Password must be at most 128 characters")
    if len(data["username"]) < 3:
        abort(400, description="Username must be at least 3 characters")
    if len(data["username"]) > 80:
        abort(400, description="Username must be at most 80 characters")

    # Create user
    user = User(username=data["username"])
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    # Auto-login after registration
    session.permanent = True
    login_user(user, remember=True)

    return jsonify(user.to_dict(include_session_info=True)), 201


@auth_bp.post("/login")
def login():
    """Authenticate user and create session."""
    data = request.get_json(silent=True) or {}

    # Validate required fields
    if not data.get("username") or not data.get("password"):
        abort(400, description="Username and password required")

    # Find user
    user = User.query.filter_by(username=data["username"]).first()

    # Verify credentials
    if not user or not user.check_password(data["password"]):
        abort(401, description="Invalid username or password")

    if not user.is_active:
        abort(403, description="Account is disabled")

    # Create session
    remember = data.get("remember", False)
    session.permanent = remember  # Make session permanent if remember=True
    login_user(user, remember=remember)

    return jsonify(user.to_dict(include_session_info=True)), 200


@auth_bp.post("/logout")
@login_required
def logout():
    """Logout user and clear session."""
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.get("/me")
def get_current_user():
    """Get current authenticated user info."""
    if current_user.is_authenticated:
        return jsonify({"user": current_user.to_dict(include_session_info=True)}), 200
    return jsonify({"user": None}), 200
