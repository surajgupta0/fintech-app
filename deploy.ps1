# Deployment setup script for fintech-app (Windows PowerShell)

Write-Host "🚀 Fintech App - Deployment Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate random hex string
function Generate-Secret {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

# Check if .env.prod exists
if (-not (Test-Path ".env.prod")) {
    Write-Host "❌ .env.prod not found!" -ForegroundColor Red
    exit 1
}

Write-Host "1️⃣  Generating JWT Secrets" -ForegroundColor Blue
$JWT_ACCESS_SECRET = Generate-Secret
$JWT_REFRESH_SECRET = Generate-Secret
Write-Host "✅ Secrets generated" -ForegroundColor Green

Write-Host ""
Write-Host "2️⃣  Environment Variables to Set:" -ForegroundColor Blue
Write-Host ""
Write-Host "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
Write-Host ""

Write-Host "3️⃣  Select Deployment Platform:" -ForegroundColor Blue
Write-Host ""
Write-Host "1) Railway (Recommended - Free, no credit card)"
Write-Host "2) Render (Free with limitations)"
Write-Host "3) AWS ECS"
Write-Host "4) Azure Container Instances"
Write-Host "5) Google Cloud Run"
Write-Host "6) Docker Compose (Local)"
Write-Host ""
$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚂 Railway.app Setup:" -ForegroundColor Blue
        Write-Host "1. Go to https://railway.app"
        Write-Host "2. Sign up with GitHub"
        Write-Host "3. Create new project"
        Write-Host "4. Add PostgreSQL database"
        Write-Host "5. Add services from docker-compose.yml"
        Write-Host "6. Set environment variables in Railway dashboard:"
        Write-Host ""
        Write-Host "DATABASE_URL=<your-railway-postgresql-url>"
        Write-Host "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
        Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
        Write-Host "FRONTEND_URL=https://your-domain.railway.app"
        Write-Host "VITE_API_URL=https://your-domain-api.railway.app/api"
        Write-Host "NODE_ENV=production"
        Write-Host ""
        Write-Host "7. Push to main branch: git push origin main"
    }
    "2" {
        Write-Host ""
        Write-Host "🎨 Render.com Setup:" -ForegroundColor Blue
        Write-Host "1. Go to https://render.com"
        Write-Host "2. Sign up with GitHub"
        Write-Host "3. Create from repository"
        Write-Host "4. Add services (Backend, Frontend, ML)"
        Write-Host "5. Set environment variables in Render dashboard"
        Write-Host "6. Deploy!"
    }
    "3" {
        Write-Host ""
        Write-Host "☁️  AWS ECS Setup:" -ForegroundColor Blue
        Write-Host "Commands to run:"
        Write-Host ""
        Write-Host "# Create ECR repositories"
        Write-Host "aws ecr create-repository --repository-name fintech-backend --region us-east-1"
        Write-Host "aws ecr create-repository --repository-name fintech-frontend --region us-east-1"
        Write-Host "aws ecr create-repository --repository-name fintech-ml --region us-east-1"
        Write-Host ""
        Write-Host "# Build and push images"
        Write-Host "docker build -t fintech-backend:latest ./backend"
    }
    "4" {
        Write-Host ""
        Write-Host "🔷 Azure Container Instances Setup:" -ForegroundColor Blue
        Write-Host "Commands to run:"
        Write-Host ""
        Write-Host "az acr login --name <acr-name>"
        Write-Host "docker build -t fintech-backend:latest ./backend"
    }
    "5" {
        Write-Host ""
        Write-Host "☁️  Google Cloud Run Setup:" -ForegroundColor Blue
        Write-Host "Commands to run:"
        Write-Host ""
        Write-Host "gcloud config set project <PROJECT_ID>"
        Write-Host "gcloud builds submit --tag gcr.io/<PROJECT_ID>/fintech-backend ./backend"
    }
    "6" {
        Write-Host ""
        Write-Host "🐳 Starting Local Docker Compose:" -ForegroundColor Blue
        Write-Host ""
        & docker-compose -f docker-compose.prod.yml up -d
        Write-Host ""
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:5173"
        Write-Host "Backend: http://localhost:4000"
        Write-Host "ML Service: http://localhost:8000"
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Read DEPLOYMENT.md for detailed instructions"
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
