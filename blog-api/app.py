import os
import secrets
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager
from database import db

# Load environment variables from .env file
load_dotenv()


def create_app() -> Flask:
    app = Flask(__name__)

    # Basic configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or secrets.token_hex(32)
    
    # Use absolute path for SQLite database to function correctly in all environments
    basedir = os.path.abspath(os.path.dirname(__file__))
    default_db_path = f"sqlite:///{os.path.join(basedir, 'blog.db')}"
    
    database_url = os.getenv("DATABASE_URL", default_db_path)
    # PostgreSQL handling removed as per request
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Session configuration for authentication
    app.config["SESSION_COOKIE_HTTPONLY"] = True  # JavaScript can't access cookie
    app.config["SESSION_COOKIE_SECURE"] = (
        os.getenv("FLASK_ENV") == "production"
    )  # HTTPS only in production
    app.config["SESSION_COOKIE_SAMESITE"] = (
        "None" if os.getenv("FLASK_ENV") == "production" else "Lax"
    )
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)

    # Initialize SQLAlchemy
    db.init_app(app)

    # Import blueprints here to avoid circular imports
    from auth import auth_bp
    from routes import api_bp
    from models import User

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(api_bp, url_prefix="/api")

    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.session_protection = "strong"

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "Authentication required"}), 401

    # Error handlers to return JSON instead of HTML
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": str(e.description) if hasattr(e, 'description') else "Bad request"}), 400

    @app.errorhandler(401)
    def unauthorized_error(e):
        return jsonify({"error": str(e.description) if hasattr(e, 'description') else "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": str(e.description) if hasattr(e, 'description') else "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": str(e.description) if hasattr(e, 'description') else "Not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # Create tables (development convenience)
    with app.app_context():
        db.create_all()

    # CORS configuration - allow credentials for cookie-based auth
    # Default to common development origins + github pages
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173", 
        "https://kanishk-upadhyay.github.io"
    ]
    
    env_origins = os.getenv("CORS_ORIGINS")
    if env_origins:
        cors_origins = env_origins.split(",") + default_origins
    else:
        cors_origins = default_origins

    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
    )

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)
