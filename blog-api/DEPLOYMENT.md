# Deploying to Render

This guide walks you through deploying the blog API to Render with a PostgreSQL database.

## Prerequisites

- GitHub account with your code pushed
- Render account (free): https://render.com

## Deployment Steps

### 1. Prepare Your Repository

Make sure all changes are committed and pushed to GitHub:

```bash
cd blog-api
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create a New Web Service on Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your blog app

### 3. Configure the Service

Render will auto-detect the `render.yaml` configuration. Verify these settings:

- **Name**: `blog-api` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `blog-api` (important!)
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT`

### 4. Environment Variables

Render will automatically set these from `render.yaml`:
- ✅ `SECRET_KEY` - Auto-generated
- ✅ `DATABASE_URL` - From PostgreSQL database
- ✅ `PYTHON_VERSION` - 3.11.0
- ✅ `FLASK_ENV` - production

**You must update** `CORS_ORIGINS` with your actual frontend URL:
1. Go to **Environment** tab in your Render service
2. Edit `CORS_ORIGINS`
3. Replace `https://yourusername.github.io` with your actual GitHub Pages URL

### 5. Database Setup

Render automatically creates a PostgreSQL database named `blog-db` as specified in `render.yaml`.

**Important**: Your local SQLite database won't transfer. After deployment:
- Database will be empty initially
- Create your first posts through the API or admin panel

### 6. Deploy

Click **"Create Web Service"** and Render will:
1. Install dependencies
2. Set up PostgreSQL database
3. Start your Flask app

Deployment takes ~2-3 minutes. Watch the logs for any errors.

### 7. Get Your API URL

After deployment succeeds, Render provides a URL like:
```
https://blog-api-xxxx.onrender.com
```

Test it:
```bash
curl https://blog-api-xxxx.onrender.com/api/health
# Should return: {"status":"ok"}
```

## Update Frontend

Update your frontend to use the production API:

### Option 1: Environment Variable (Recommended)

Create `.env.production` in your frontend root:
```env
VITE_API_BASE=https://blog-api-xxxx.onrender.com/api
```

### Option 2: Direct Update

Edit `src/lib/api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE ?? 
  "https://blog-api-xxxx.onrender.com/api";
```

## Important Notes

### Cold Starts (Free Tier)
- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to paid ($7/month) for 24/7 availability

### Database Persistence
- PostgreSQL data persists across deploys
- Free tier has 1GB storage limit
- Database backups available on paid plans

### CORS Configuration
Render auto-configures CORS based on `CORS_ORIGINS`. To add multiple origins:
```
CORS_ORIGINS=https://yourdomain.com,https://yourname.github.io
```

### Logs and Monitoring
- View logs: Render Dashboard → Your Service → Logs
- Monitor health: `/api/health` endpoint
- Set up alerts in Render settings

## Troubleshooting

### Build Fails
- Check Python version compatibility
- Verify all dependencies in `requirements.txt`
- Check build logs for specific errors

### Database Connection Errors
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution**: Database is still initializing. Wait 1-2 minutes.

### CORS Errors in Browser
```
Access to fetch blocked by CORS policy
```
**Solution**: Update `CORS_ORIGINS` environment variable with your frontend URL.

### 404 on API Endpoints
Make sure you're using `/api` prefix:
- ✅ `https://blog-api-xxxx.onrender.com/api/posts`
- ❌ `https://blog-api-xxxx.onrender.com/posts`

## Updating Your Deployment

Render auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render automatically rebuilds and deploys
```

## Cost Estimate

**Free Tier** (what you're using):
- Web Service: Free (with cold starts)
- PostgreSQL: Free (1GB storage)
- Custom domain: Free
- SSL: Free

**Paid Tier** (if needed later):
- Web Service: $7/month (no cold starts)
- PostgreSQL: $7/month (10GB storage)

## Next Steps

1. Set up GitHub Pages for frontend
2. Configure production CORS origins
3. Add health check monitoring
4. Set up database backups (paid feature)
5. Consider Alembic migrations for schema changes
