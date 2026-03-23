# Fintech App - Deployment Guide

## 📋 Environment Files Overview

### Files Created:

- **`.env`** - Development environment variables (for local testing)
- **`.env.prod`** - Production environment variables (for cloud deployment)
- **`docker-compose.yml`** - Development compose file
- **`docker-compose.prod.yml`** - Production compose file

---

## � Git & GitHub Workflow

### ✅ Your Current Setup: **MONOREPO** (All in One)

Your project structure keeps everything together:

```
fintech-app/
├── backend/          ← Node.js API
├── frontend/         ← React app
├── ml-service/       ← Python service
├── docker-compose.yml
├── .env
└── .gitignore
```

**✅ BEST APPROACH: Push all together in one repo**

### 🚀 How to Push Your Code

#### 1️⃣ **Initial Setup** (First time only):

```bash
# Navigate to your project
cd fintech-app

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: fintech app with backend, frontend, and ML service"

# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/your-username/fintech-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### 2️⃣ **Regular Updates** (After making changes):

```bash
# Check what changed
git status

# Add all changes
git add .

# Or add specific files
git add backend/
git add frontend/
git add ml-service/

# Commit with meaningful message
git commit -m "Update: Add new transaction features"

# Push to GitHub (all 3 services at once)
git push origin main
```

#### 3️⃣ **Check Your Repo Status Anytime**:

```bash
# See commit history
git log --oneline

# See current status
git status

# See what's staged
git diff --staged
```

### 📋 Git Best Practices

| Action                | Command                               |
| --------------------- | ------------------------------------- |
| Check changes         | `git status`                          |
| Stage all             | `git add .`                           |
| Stage specific folder | `git add backend/`                    |
| Commit                | `git commit -m "message"`             |
| Push                  | `git push origin main`                |
| Pull latest           | `git pull origin main`                |
| View history          | `git log --oneline`                   |
| Create branch         | `git checkout -b feature/new-feature` |

---

## �🚀 Local Development Deployment

### Prerequisites:

- Docker installed
- Docker Compose installed
- Git installed

### Steps:

1. **Clone and setup:**

```bash
git clone <your-repo>
cd fintech-app
cp .env.example .env
```

2. **Update `.env` with your local values:**

```bash
# Edit .env with your local database and secrets
nano .env
```

3. **Start all services:**

```bash
docker-compose up -d
```

4. **Check services:**

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ml-service
```

5. **Stop services:**

```bash
docker-compose down
```

---

## ☁️ Cloud Deployment Guide

### 1️⃣ **Railway.app (Recommended - No Credit Card)**

#### Setup:

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Create new project
3. Add services:
   - Backend (Docker)
   - Frontend (Docker)
   - PostgreSQL (Railway provides managed DB)

#### Steps:

```bash
# 1. Connect your GitHub repo
# 2. Railway auto-detects docker-compose.yml and builds

# 3. Set environment variables in Railway dashboard:
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_ACCESS_SECRET=<generate-strong-random-string>
JWT_REFRESH_SECRET=<generate-strong-random-string>
FRONTEND_URL=https://your-domain-on-railway.app
VITE_API_URL=https://api-your-domain.railway.app/api
NODE_ENV=production
...

# 4. Deploy: Just push to main branch!
git push origin main
```

#### Generate Strong Secrets:

```bash
# On Linux/Mac:
openssl rand -hex 32

# On Windows (PowerShell):
[System.Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

---

### 2️⃣ **AWS Elastic Container Service (ECS)**

#### Setup:

1. Create ECR repository for each service
2. Create RDS PostgreSQL database
3. Create Application Load Balancer
4. Create ECS cluster

#### Push images to ECR:

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
docker build -t fintech-backend ./backend
docker tag fintech-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-backend:latest

# Build and push frontend
docker build -t fintech-frontend ./frontend
docker tag fintech-frontend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-frontend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-frontend:latest

# Build and push ML service
docker build -t fintech-ml ./ml-service
docker tag fintech-ml:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-ml:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-ml:latest
```

#### Environment Variables in ECS Task Definition:

Use AWS Secrets Manager for sensitive data:

```json
{
  "name": "DATABASE_URL",
  "valueFrom": "arn:aws:secretsmanager:region:account:secret:fintech/db-url"
}
```

---

### 3️⃣ **Azure Container Instances (ACI)**

#### Setup:

1. Create Azure Container Registry
2. Create Azure Database for PostgreSQL
3. Create Container Instances

#### Push to ACR:

```bash
# Login to ACR
az acr login --name <acr-name>

# Build and push
docker build -t fintech-backend:latest ./backend
docker tag fintech-backend:latest <acr-name>.azurecr.io/fintech-backend:latest
docker push <acr-name>.azurecr.io/fintech-backend:latest
```

#### Deploy with Azure CLI:

```bash
az container create \
  --resource-group myResourceGroup \
  --name fintech-backend \
  --image <acr-name>.azurecr.io/fintech-backend:latest \
  --environment-variables DATABASE_URL=<your-db-url> \
  --registry-login-server <acr-name>.azurecr.io \
  --registry-username <username> \
  --registry-password <password>
```

---

### 4️⃣ **Google Cloud Run**

#### Setup:

1. Create Cloud SQL PostgreSQL instance
2. Build and push to Container Registry
3. Deploy to Cloud Run

#### Build and Push:

```bash
# Set project
gcloud config set project <PROJECT_ID>

# Build backend
gcloud builds submit --tag gcr.io/<PROJECT_ID>/fintech-backend ./backend

# Build frontend
gcloud builds submit --tag gcr.io/<PROJECT_ID>/fintech-frontend ./frontend

# Build ML service
gcloud builds submit --tag gcr.io/<PROJECT_ID>/fintech-ml ./ml-service
```

#### Deploy to Cloud Run:

```bash
gcloud run deploy fintech-backend \
  --image gcr.io/<PROJECT_ID>/fintech-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=<your-cloudsql-url>
```

---

### 5️⃣ **Render.com (Free with Limitations)**

#### Setup:

1. Go to [render.com](https://render.com)
2. Connect GitHub (no credit card needed)
3. Create services for each component

#### Create Blueprint (render.yaml):

```yaml
services:
  - type: web
    name: fintech-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DATABASE_URL
        scope: run
        value: ${DATABASE_URL}
      - key: NODE_ENV
        value: production

  - type: web
    name: fintech-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile
```

---

## � Complete "Push to Deploy" Workflow

### **STEP 1: Make Changes & Test Locally**

```bash
# Make changes to backend/frontend/ml-service

# Test locally with Docker Compose
docker-compose down  # Stop old containers
docker-compose up -d # Start with new changes
docker-compose logs -f backend  # Check for errors
```

### **STEP 2: Commit & Push All Changes Together**

```bash
# Check what changed
git status

# Add all changes (backend + frontend + ml-service)
git add .

# Commit with meaningful message
git commit -m "feat: Add transaction filtering and improve UI"

# Push to GitHub (this triggers deployment on Railway/Render)
git push origin main
```

### **STEP 3: Cloud Platform Deploys Automatically**

#### **If using Railway:**

1. Your GitHub webhook triggers automatically
2. Railway detects `docker-compose.yml`
3. Builds all 3 services
4. Deploys automatically
5. Check Railway dashboard for status

#### **If using Render:**

1. GitHub webhook triggers
2. Render deploys according to `render.yaml`
3. Check Render dashboard for build logs

#### **If using AWS/Azure/GCP:**

1. Manual build & push commands needed (see platform sections above)

### **STEP 4: Verify Deployment**

```bash
# After deployment completes:

# Check Railway/Render dashboard
# Click on "Logs" to view service logs

# Or test endpoints:
curl https://your-domain.railway.app/api/health
curl https://your-domain.onrender.com/api/health
```

---

## 📊 Quick Reference: Git + Deploy Flow

```
Make changes to files
        ↓
docker-compose down
        ↓
docker-compose up -d (test locally)
        ↓
git status (see changes)
        ↓
git add .
        ↓
git commit -m "message"
        ↓
git push origin main (PUSH TO GITHUB)
        ↓
AUTOMATIC DEPLOYMENT STARTS (Railway/Render)
        ↓
Docker images built
        ↓
Services deployed
        ↓
Check cloud dashboard
        ↓
Test live URL
```

---

## �🔐 Security Best Practices

### Before Deploying:

1. **Never commit `.env` files**

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.prod" >> .gitignore
echo ".env.local" >> .gitignore
```

2. **Generate strong secrets:**

```bash
# 32-character random string for JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Use secrets management:**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - Render Environment Variables

4. **Update FRONTEND_URL:**

```
Development:  http://localhost:5173
Render:       https://your-app.onrender.com
Railway:      https://your-app.railway.app
AWS:          https://your-domain.com
```

5. **Enable HTTPS:**

```
All cloud providers offer free SSL/TLS
Configure in load balancer or reverse proxy
```

---

## 📊 Container Health Checks

All services have health checks configured:

```bash
# Check backend health
docker-compose exec backend curl http://localhost:4000/health

# Check ML service health
docker-compose exec ml-service curl http://localhost:8000/health

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml-service
```

---

## 🆘 Troubleshooting

### Services won't start:

```bash
docker-compose logs backend
docker-compose ps
```

### Database connection issues:

```bash
# Verify DATABASE_URL format
docker-compose exec backend echo $DATABASE_URL

# Test connection
docker-compose exec backend psql $DATABASE_URL -c "SELECT 1"
```

### Frontend API connection issues:

```bash
# Check VITE_API_URL
docker-compose exec frontend env | grep VITE
```

### Port conflicts:

```bash
# Change ports in docker-compose.yml:
ports:
  - "8000:4000"  # Host:Container
```

---

## 📝 Summary Commands

### Development:

```bash
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f        # View logs
docker-compose ps             # Check status
```

### Production (Cloud):

```bash
# Set which env file to use:
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Next Steps

1. Choose your cloud provider (Railway recommended for free)
2. Update `.env.prod` with your cloud database
3. Generate strong JWT secrets
4. Set environment variables in your cloud provider
5. Deploy using provider's interface or CLI
6. Test the deployed application

Happy deploying! 🚀
