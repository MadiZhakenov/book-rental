#!/bin/bash

# Kill child processes on exit
trap 'kill $(jobs -p)' SIGINT

echo "🚀 Starting services without Turbo..."

# Start API in background
echo "📦 Starting API (localhost:4000)..."
(cd apps/api && npm run dev) &
API_PID=$!

# Start Web in background
echo "🌐 Starting Web (localhost:3000)..."
(cd apps/web && npm run dev) &
WEB_PID=$!

# Wait for both
wait $API_PID $WEB_PID
