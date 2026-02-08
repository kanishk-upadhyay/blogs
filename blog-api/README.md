# Flask Blog API (No Auth) — Development Guide

This backend provides a minimal REST API for a blog, designed to work with a Vite + React + Tailwind frontend. It uses Flask, SQLAlchemy, and SQLite for rapid local development.

## Features

- Posts CRUD (create, read, update, delete)
- SQLite database (file-based, no external setup)
- CORS configured for Vite dev server
- Health check endpoint
- Markdown-friendly `content` field

## Project Structure

- `app.py` — Flask app factory, CORS setup, blueprint registration
- `models.py` — SQLAlchemy models (`Post`)
- `routes.py` — API endpoints (CRUD)
- `requirements.txt` — Python dependencies

## Quick Start

1) Create and activate a virtual environment

- macOS/Linux:
  - `python3 -m venv .venv`
  - `source .venv/bin/activate`
- Windows (PowerShell):
  - `python -m venv .venv`
  - `.venv\Scripts\Activate.ps1`

2) Install dependencies

- `pip install -r requirements.txt`

3) Run the server (development)

- `python app.py`

The server starts at http://localhost:5000 with API under `/api`.

## Environment Variables (Optional)

These can be set in your shell or via a `.env` file (if you choose to load it):

- `SECRET_KEY` — Flask secret key (default: `dev`)
- `DATABASE_URL` — SQLAlchemy database URL (default: `sqlite:///blog.db`)

By default, the SQLite file `blog.db` is created in the backend working directory.

## CORS

CORS allows requests from `http://localhost:5173` (Vite dev server). Adjust in `app.py` if your frontend/dev host differs:
- `CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})`

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /health`
  - Health check: `{ "status": "ok" }`

- `GET /posts`
  - List posts (published only by default)
  - Query params:
    - `published=false` to include all posts
  - Response: `[{ id, title, slug, excerpt, content, published, published_at, created_at, updated_at }]`

- `GET /posts/:slug`
  - Get a single post by slug

- `POST /posts`
  - Create a post
  - Body (JSON):
    - `title` (string, required)
    - `slug` (string, required, unique)
    - `content` (string, required, markdown)
    - `excerpt` (string, optional)
    - `published` (boolean, optional)
  - Example:
    ```
    {
      "title": "Hello World",
      "slug": "hello-world",
      "content": "# My first post",
      "excerpt": "A short summary",
      "published": true
    }
    ```

- `PUT /posts/:id`
  - Update a post by ID
  - Body: any subset of fields (same as POST), empty required fields are rejected
  - Changing `slug` checks for uniqueness

- `DELETE /posts/:id`
  - Delete a post by ID

## Dev Tips

- Frontend proxy (optional):
  - In your Vite config, proxy API routes for cleaner fetch URLs:
    ```
    server: {
      proxy: { "/api": "http://localhost:5000" }
    }
    ```
- Use `content` as Markdown in the frontend (e.g., `react-markdown`) with Tailwind `prose` classes.
- The `published_at` timestamp is set automatically when `published` is true for the first time; cleared if `published` becomes false.

## Common Commands

- Install: `pip install -r requirements.txt`
- Run: `python app.py`
- Freeze dependencies (if needed): `pip freeze > requirements.txt`
- Remove venv: `rm -rf .venv` (macOS/Linux) or delete the `.venv` folder (Windows)

## Notes

- This API is intentionally unauthenticated for development convenience. If exposed publicly, consider adding at least a simple write-protection mechanism (e.g., shared secret or IP allowlist).
- For production, add proper migrations (Alembic) and run behind a WSGI server (e.g., gunicorn). The included `requirements.txt` contains `gunicorn` for that purpose.