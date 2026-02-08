# Blog Application

A modern blog platform with a Flask REST API backend and React + TypeScript frontend using shadcn/ui components.

## Features

- 📝 Create, edit, and publish blog posts with Markdown support
- 🎨 Modern UI with shadcn/ui components and Tailwind CSS
- 🔄 Draft/publish workflow
- 🎯 Type-safe API client with TypeScript
- 📱 Responsive design

## Project Structure

```
blogs/
├── blog-api/          # Flask backend API
│   ├── app.py         # Application factory
│   ├── models.py      # SQLAlchemy models
│   ├── routes.py      # API endpoints
│   └── requirements.txt
├── src/               # React frontend
│   ├── components/    # UI components (shadcn/ui)
│   ├── lib/          # API client and utilities
│   └── pages/        # Page components
└── package.json
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd blog-api
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

5. Run the development server:
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000/api`

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Documentation

See [blog-api/README.md](blog-api/README.md) for detailed API documentation.

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Development database (easily switchable to PostgreSQL/MySQL)
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI library with React Compiler
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **React Router** - Client-side routing
- **react-markdown** - Markdown rendering with GFM support

## Development

- **Backend linting**: (TBD - add flake8/black)
- **Frontend linting**: `npm run lint`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

## Deployment

### Backend (Render)

This project is configured for easy deployment to Render with PostgreSQL.

📖 **See [blog-api/DEPLOYMENT.md](blog-api/DEPLOYMENT.md) for complete deployment instructions.**

Quick summary:
1. Push your code to GitHub
2. Connect repository to Render
3. Render auto-detects `render.yaml` configuration
4. PostgreSQL database is automatically provisioned
5. Your API is live at `https://your-app.onrender.com`

### Frontend (GitHub Pages)

Deploy the React frontend to GitHub Pages:

```bash
npm run build
# Deploy the dist/ folder to gh-pages branch
```

Or use GitHub Actions for automatic deployment on every push.

## License

(Add your license information here)
