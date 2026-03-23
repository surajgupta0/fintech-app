#!/bin/bash
# Railway deployment - this should not be reached when using Docker
# If you see this, Railway is using buildpacks instead of Docker

echo "Starting Fintech App Backend..."
cd backend && npm start
