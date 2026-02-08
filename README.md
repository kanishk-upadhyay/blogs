# Blog Application

A modern, production-ready blog platform featuring a robust Flask REST API backend and a high-performance React + TypeScript frontend. Designed with a sleek, minimalist aesthetic inspired by 404media, featuring a custom violet theme and focusing on readability.

![Blog Application Screenshot](https://via.placeholder.com/800x450?text=Blog+Application+Preview)

## ✨ Key Features

- **✍️ Markdown Editor**: Rich text editing experience with live preview, word count, and formatting toolbar.
- **🎨 Modern Aesthetic**:
  - Custom **Violet** theme using **shadcn/ui** components.
  - **Dark Mode** support with seamless toggling.
  - **"404media" inspired** clean typography and layout.
- **🔍 SEO Optimized**: Dynamic metadata (title, description, OG tags) for every page using native React metadata API.
- **📱 Responsive**: Fully responsive design that looks great on mobile, tablet, and desktop.
- **🔒 Secure Authentication**: Robust user authentication system with secure session management.
- **⚡ Performance**:
  - Code-splitting with `React.lazy` and `Suspense`.
  - Optimized asset loading.
  - Fast backend responses with SQLAlchemy performance tuning.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast notifications)
- **Routing**: React Router DOM (v6)
- **State Management**: Context API
- **Utilities**: date-fns (Date formatting), clsx/tailwind-merge

### Backend
- **Framework**: Flask (Python)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Authentication**: Flask-Login + Bcrypt
- **API**: RESTful architecture

## 📂 Project Structure

```
blogs/
├── blog-api/          # Flask Backend
│   ├── app.py         # Application factory
│   ├── auth.py        # Authentication routes
│   ├── models.py      # Database models
│   ├── routes.py      # API endpoints
│   ├── requirements.txt
│   └── DEPLOYMENT.md  # Detailed deployment guide
├── src/               # React Frontend
│   ├── components/    # Reusable UI components
│   │   ├── posts/     # Post-related components
│   │   └── ui/        # shadcn/ui primitives
│   ├── contexts/      # React Context (Auth, Theme)
│   ├── lib/           # Utilities & API client
│   └── pages/         # Application pages
└── package.json
```

## 🚀 Getting Started

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd blog-api
   ```

2. **Set up Virtual Environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Server:**
   ```bash
   python app.py
   ```
   API runs at `http://localhost:5000/api`

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create `.env.local`:
   ```env
   VITE_API_BASE=http://localhost:5000/api
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`

## 🌍 Deployment

### Backend (PythonAnywhere)
**Recommended for Free Hosting (No Credit Card)**
The backend is optimized for deployment on PythonAnywhere's free tier.
- Supports persistent SQLite database.
- Easy setup with `wsgi.py`.
- **See [blog-api/DEPLOYMENT_PYTHONANYWHERE.md](blog-api/DEPLOYMENT_PYTHONANYWHERE.md) for step-by-step instructions.**

### Backend (Render)
**Alternative (Requires Credit Card for Verification)**
Configured for zero-config deployment on Render.
- Includes `render.yaml` for infrastructure-as-code.
- Auto-provisions PostgreSQL database.
- See **[blog-api/DEPLOYMENT.md](blog-api/DEPLOYMENT.md)** for full instructions.

### Frontend
Built for static hosting (Vercel, Netlify, GitHub Pages).
```bash
npm run build
```
Deploy the `dist/` folder.

## 📄 License
MIT License. Free to use and modify.
