#!/bin/bash
set -e

echo "Starting Fintech App Backend..."

if ! command -v npm >/dev/null 2>&1; then
	echo "ERROR: npm not found in this runtime."
	echo "This Railway service is not using a Node runtime for backend."
	echo "Fix: Railway service -> Settings -> Root Directory = backend"
	echo "Fix: Use Dockerfile builder (backend/Dockerfile) OR Node with npm start in backend"
	exit 1
fi

cd backend
npm ci
npm run build
npm start
