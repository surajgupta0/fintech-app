# 🚀 Quick Start - Push & Deploy Guide

## ✅ Your Setup (Monorepo - Everything in One Repo)

```
You have:
✓ backend/       (Node.js API)
✓ frontend/      (React UI)
✓ ml-service/    (Python)
✓ docker-compose.yml (all 3 services together)
✓ .env files
✓ .gitignore
```

**Best Practice: Push all 3 together in same commit!**

---

## 🎯 STEP 1: First Time Setup (Create GitHub Repo)

### If GitHub repo doesn't exist yet:

```bash
# Go to GitHub.com → Create new repository
# Name: fintech-app
# Don't add README/gitignore (you already have one)
# Copy the repo URL: https://github.com/YOUR_USERNAME/fintech-app.git
```

### Connect your local code to GitHub:

```bash
cd fintech-app

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/fintech-app.git

# Rename branch to main
git branch -M main

# Add all files
git add .

# First commit
git commit -m "Initial commit: fintech-app with backend, frontend, ML service"

# Push everything
git push -u origin main
```

---

## ✏️ STEP 2: Make Changes & Test

```bash
# Edit files in backend/, frontend/, or ml-service/
# For example, fix a bug or add a feature

# Test locally FIRST
docker-compose down        # Stop old version
docker-compose up -d       # Start new version
docker-compose logs -f     # Watch logs for errors
```

---

## 📤 STEP 3: Push Changes (All Together)

```bash
# See what changed
git status

# Stage all changes
git add .

# Commit with message
git commit -m "fix: Update transaction filtering"

# Push to GitHub
git push origin main

# Done! Cloud platform deploys automatically
```

---

## ☁️ STEP 4: Deployment (Choose One Platform)

### **Option A: Railway (Easiest ⭐)**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Click "Deploy from GitHub repo"
5. Select: `fintech-app`
6. Railway auto-detects `docker-compose.yml`
7. Add PostgreSQL database
8. Set environment variables:
   ```
   DATABASE_URL = [from PostgreSQL plugin]
   JWT_ACCESS_SECRET = [generate]
   JWT_REFRESH_SECRET = [generate]
   FRONTEND_URL = https://your-app.railway.app
   VITE_API_URL = https://your-app-api.railway.app/api
   NODE_ENV = production
   ```
9. Deploy!
10. Done - automatically redeploys on each git push

### **Option B: Render.com**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +"
4. Select "Web Service"
5. Select your `fintech-app` repo
6. Runtime: Docker
7. Set environment variables
8. Deploy!

### **Option C: Docker Compose (Local Server)**

```bash
# Copy production env file
cp .env.example .env.prod

# Edit with your database URL
nano .env.prod

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# Access at localhost:5173, localhost:4000
```

---

## 📋 Quick Commands Reference

| Action                     | Command                                           |
| -------------------------- | ------------------------------------------------- |
| **See changes**            | `git status`                                      |
| **Add all changes**        | `git add .`                                       |
| **Commit changes**         | `git commit -m "message"`                         |
| **Push to GitHub**         | `git push origin main`                            |
| **Pull latest**            | `git pull origin main`                            |
| **See commit history**     | `git log --oneline`                               |
| **Start services locally** | `docker-compose up -d`                            |
| **Stop services**          | `docker-compose down`                             |
| **View logs**              | `docker-compose logs -f backend`                  |
| **Test in production**     | `docker-compose -f docker-compose.prod.yml up -d` |

---

## 🔑 Generate Strong Secrets

Run ONE of these commands and copy the output:

### Linux/Mac:

```bash
openssl rand -hex 32
```

### Windows PowerShell:

```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

Use this value for both:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

---

## ⚡ Typical Workflow (After First Setup)

```bash
# 1. Make changes in editor
# 2. Test locally
docker-compose down
docker-compose up -d

# 3. Push changes
git add .
git commit -m "feat: new feature"
git push origin main

# 4. Wait ~2-3 minutes
# 5. Check cloud dashboard (Railway/Render)
# 6. Visit deployed URL
# Done! ✅
```

---

## ❓ Common Questions

### Q: Do I push backend, frontend, and ml-service separately?

**A:** No! Push them all together in one commit:

```bash
git add .  # This adds ALL changes from all 3 services
git commit -m "message"
git push origin main
```

### Q: How often do I push?

**A:** Whenever you want to deploy new changes. Push = Deploy (automatic).

### Q: Can I just push one service?

**A:** Yes, but all 3 get redeployed anyway (because they're in same repo). That's normal.

### Q: Where do I set .env values?

**A:**

- Local: Edit `.env` file
- Cloud (Railway): Set in Railway dashboard UI
- Cloud (Render): Set in render "Environment" tab

### Q: What if deployment fails?

**A:** Check cloud platform's "Logs" section to see error

### Q: Do I need to push to deploy locally?

**A:** No, just run `docker-compose up -d` to test locally without pushing

---

## 📞 Need Help?

1. Read `DEPLOYMENT.md` for detailed platform guides
2. Run `./deploy.sh` (Mac/Linux) or `.\deploy.ps1` (Windows) for setup wizard
3. Check cloud platform's documentation

Happy coding! 🎉
