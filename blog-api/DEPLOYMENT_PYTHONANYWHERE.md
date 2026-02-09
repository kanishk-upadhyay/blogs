# Deploying to PythonAnywhere (Free & No Credit Card)

PythonAnywhere is an excellent free option for hosting Python (Flask) apps. It supports persistent file storage, meaning your SQLite database will work perfectly without needing a separate database service.

**Prerequisites:**
- GitHub account with your code pushed.
- PythonAnywhere account (Free "Beginner" tier): https://www.pythonanywhere.com/

## Deployment Steps

### 1. Sign Up & Open Bash Console
1.  Sign up for a free account at [https://www.pythonanywhere.com/](https://www.pythonanywhere.com/).
2.  Once logged in, go to the **Consoles** tab.
3.  Click **Bash** to open a terminal.

### 2. Clone Your Repository
In the Bash console, run:

```bash
# Clone your repo (replace with your GitHub username)
git clone https://github.com/kanishk-upadhyay/blogs.git

# Enter the backend directory
cd blogs/blog-api
```

### 3. Set Up Virtual Environment
Create and activate the virtual environment:

```bash
# Create virtual env
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Set Up Web App
1.  Go to the **Web** tab (top right).
2.  Click **Add a new web app**.
3.  Click **Next**.
4.  Select **Manual configuration** (NOT Flask - we want full control).
5.  Select **Python 3.10** (or your preferred version).
6.  Click **Next**.

### 5. Configure WSGI File
1.  On the **Web** tab, scroll down to the **Code** section.
2.  Click the link next to **WSGI configuration file** (e.g., `/var/www/yourusername_pythonanywhere_com_wsgi.py`).
3.  **Delete everything** in that file and replace it with this:

```python
import sys
import os

# add your project directory to the sys.path
project_home = '/home/yourusername/blogs/blog-api'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# import flask app but need to call it "application" for WSGI to work
from wsgi import app as application
```

# import flask app but need to call it "application" for WSGI to work
from wsgi import app as application
```

> **IMPORTANT**: Replace `yourusername` with your actual PythonAnywhere username!

### 7. Configure Virtual Environment Path
1.  Back on the **Web** tab, scroll to the **Virtualenv** section.
2.  Enter the path to your virtual environment:
    `/home/yourusername/blogs/blog-api/.venv`
    *(Replace `yourusername` with your actual username)*.

### 8. essential: Configure Source Code Path
1.  On the **Web** tab, scroll to the **Code** section (top).
2.  **Source code**: Set this to `/home/yourusername/blogs/blog-api`
3.  **Working directory**: Set this to `/home/yourusername/blogs/blog-api`
    *(Ensure these point to the folder containing `app.py`, NOT the `.venv` folder!)*

### 9. Reload and Visit
1.  Scroll to the top of the **Web** tab.
2.  Click the big green **Reload** button.
3.  Visit your site at `https://yourusername.pythonanywhere.com/api/health`.

---

## Validating Deployment

You can test if it's working by visiting:
`https://yourusername.pythonanywhere.com/api/posts`

## Updating Frontend

Now that you have a new backend URL, update your frontend environment locally or on deployment (Vercel/Netlify/GitHub Pages):

**VITE_API_BASE**: `https://yourusername.pythonanywhere.com/api`
