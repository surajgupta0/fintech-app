# Railway Deployment Guide - Fix the Build Error

## ❌ Error: "start.sh not found" / "Railpack could not determine how to build"

This happens when Railway tries to use **Buildpacks** instead of **Docker**.

---

## ✅ Solution: Deploy Services Separately on Railway

Railway works best with monorepo when deploying services individually. Follow these steps:

### **Step 1: In Railway Dashboard**

1. Go to your Railway project
2. Click **"+ Add"** (top right)
3. Select **"GitHub Repo"**
4. Select your `fintech-app` repository
5. Important: Select **specific service**, NOT root

### **Step 2: Deploy Backend Service**

1. **Add → GitHub Repo → fintech-app**
2. In **Deploy** settings:
   - **Build command**: Leave empty (uses Dockerfile)
   - **Start command**: Leave empty (uses Dockerfile CMD)
   - **Root directory**: `./backend` ← **IMPORTANT!**
3. Click **Deploy**

### **Step 3: Deploy Frontend Service**

1. **Add → GitHub Repo → fintech-app**
2. In **Deploy** settings:
   - **Root directory**: `./frontend` ← **IMPORTANT!**
3. Click **Deploy**

### **Step 4: Deploy ML Service**

1. **Add → GitHub Repo → fintech-app**
2. In **Deploy** settings:
   - **Root directory**: `./ml-service` ← **IMPORTANT!**
3. Click **Deploy**

### **Step 5: Add PostgreSQL**

1. **Add → PostgreSQL**
2. Railway creates database automatically
3. Copy `DATABASE_URL` connection string

### **Step 6: Set Environment Variables**

For **backend** service:

```
DATABASE_URL = [from PostgreSQL]
JWT_ACCESS_SECRET = [generate]
JWT_REFRESH_SECRET = [generate]
NODE_ENV = production
FRONTEND_URL = https://frontend-domain.railway.app
VITE_API_URL = https://backend-domain.railway.app/api
ML_SERVICE_URL = http://ml-service:8000
PORT = 4000
MAX_FILE_SIZE_MB = 50
UPLOAD_DIR = /app/uploads
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
AUTH_RATE_LIMIT_MAX = 10
```

For **frontend** service:

```
VITE_API_URL = https://backend-domain.railway.app/api
```

For **ml-service**:

```
No special vars needed
```

### **Step 7: Wait for Deploy**

- Each service builds and deploys separately
- Takes 5-10 minutes total
- Check **Logs** tab for each service

---

## 🔄 How to Redeploy After Code Changes

Since Railway deployed from GitHub, it watches your repo:

```bash
# Make changes locally
git add .
git commit -m "Update backend logic"
git push origin main

# Railway auto-redeploys all 3 services!
```

---

## 📱 Your Live URLs

| Service      | URL                                      |
| ------------ | ---------------------------------------- |
| Frontend     | `https://frontend-xxx.railway.app`       |
| Backend API  | `https://backend-xxx.railway.app/api`    |
| ML Service   | `https://ml-xxx.railway.app`             |
| Health Check | `https://backend-xxx.railway.app/health` |

---

## ❓ Why Separate Services?

Railway works best with:

- **Monorepo** (single GitHub repo) ✅ You have this
- **Multiple services** deployed individually ✅ We'll do this
- **Internal networking** (ml-service → backend communication) ✅ Railway handles this automatically
- **docker-compose.yml** (docker-compose is for LOCAL development only)

---

## 🆘 Still Getting Errors?

### Error: "Root directory ./backend not found"

- Make sure you selected the correct GitHub repo
- Check that backend/ folder exists in your repo

### Error: "Dockerfile not found in ./backend"

- Verify `backend/Dockerfile` exists
- It should have `FROM node:20-alpine` at the top

### Services can't communicate?

- Use service name from Railway internal network
- e.g., `http://ml-service:8000` (Railway creates DNS)

---

## 💡 Pro Tips

1. **Delete old deployment** - Remove failed deployment attempts first
2. **Check Logs** - Click service → Logs tab to debug
3. **Restart service** - Railway sometimes needs manual restart
4. **Test health endpoint** - Verify backend deployed: `curl https://backend-xxx.railway.app/health`

Ready? Go to Railway dashboard and follow steps 1-7 above! 🚀
