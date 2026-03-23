#!/bin/bash
# Deployment setup script for fintech-app

set -e

echo "🚀 Fintech App - Deployment Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate random hex string
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32
    else
        # Fallback to /dev/urandom
        head -c 32 /dev/urandom | base64
    fi
}

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo -e "${YELLOW}❌ .env.prod not found!${NC}"
    exit 1
fi

echo -e "${BLUE}1️⃣  Generating JWT Secrets${NC}"
JWT_ACCESS_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)
echo -e "${GREEN}✅ Secrets generated${NC}"

echo ""
echo -e "${BLUE}2️⃣  Environment Variables to Set:${NC}"
echo ""
echo "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""

echo -e "${BLUE}3️⃣  Select Deployment Platform:${NC}"
echo ""
echo "1) Railway (Recommended - Free, no credit card)"
echo "2) Render (Free with limitations)"
echo "3) AWS ECS"
echo "4) Azure Container Instances"
echo "5) Google Cloud Run"
echo "6) Docker Compose (Local)"
echo ""
read -p "Enter your choice (1-6): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo -e "${BLUE}🚂 Railway.app Setup:${NC}"
        echo "1. Go to https://railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Create new project"
        echo "4. Add PostgreSQL database"
        echo "5. Add services from docker-compose.yml"
        echo "6. Set environment variables in Railway dashboard:"
        echo ""
        echo "DATABASE_URL=<your-railway-postgresql-url>"
        echo "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
        echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
        echo "FRONTEND_URL=https://your-domain.railway.app"
        echo "VITE_API_URL=https://your-domain-api.railway.app/api"
        echo "NODE_ENV=production"
        echo ""
        echo "7. Push to main branch: git push origin main"
        ;;
    2)
        echo ""
        echo -e "${BLUE}🎨 Render.com Setup:${NC}"
        echo "1. Go to https://render.com"
        echo "2. Sign up with GitHub"
        echo "3. Create from repository"
        echo "4. Add services (Backend, Frontend, ML)"
        echo "5. Set environment variables in Render dashboard"
        echo "6. Deploy!"
        ;;
    3)
        echo ""
        echo -e "${BLUE}☁️  AWS ECS Setup:${NC}"
        echo "Commands to run:"
        echo ""
        echo "# Create ECR repositories"
        echo "aws ecr create-repository --repository-name fintech-backend --region us-east-1"
        echo "aws ecr create-repository --repository-name fintech-frontend --region us-east-1"
        echo "aws ecr create-repository --repository-name fintech-ml --region us-east-1"
        echo ""
        echo "# Login to ECR"
        echo "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com"
        echo ""
        echo "# Build and push images"
        echo "docker build -t fintech-backend:latest ./backend"
        echo "docker tag fintech-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-backend:latest"
        echo "docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fintech-backend:latest"
        ;;
    4)
        echo ""
        echo -e "${BLUE}🔷 Azure Container Instances Setup:${NC}"
        echo "Commands to run:"
        echo ""
        echo "# Login to ACR"
        echo "az acr login --name <acr-name>"
        echo ""
        echo "# Build and push"
        echo "docker build -t fintech-backend:latest ./backend"
        echo "docker tag fintech-backend:latest <acr-name>.azurecr.io/fintech-backend:latest"
        echo "docker push <acr-name>.azurecr.io/fintech-backend:latest"
        ;;
    5)
        echo ""
        echo -e "${BLUE}☁️  Google Cloud Run Setup:${NC}"
        echo "Commands to run:"
        echo ""
        echo "gcloud config set project <PROJECT_ID>"
        echo "gcloud builds submit --tag gcr.io/<PROJECT_ID>/fintech-backend ./backend"
        echo "gcloud run deploy fintech-backend --image gcr.io/<PROJECT_ID>/fintech-backend --region us-central1"
        ;;
    6)
        echo ""
        echo -e "${BLUE}🐳 Local Docker Compose:${NC}"
        echo ""
        echo "Starting services..."
        docker-compose -f docker-compose.prod.yml up -d
        echo ""
        echo -e "${GREEN}✅ Services started!${NC}"
        echo "Frontend: http://localhost:5173"
        echo "Backend: http://localhost:4000"
        echo "ML Service: http://localhost:8000"
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "📋 Read DEPLOYMENT.md for detailed instructions"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
