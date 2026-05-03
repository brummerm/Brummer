#!/usr/bin/env bash
# Build script for Render. Runs on every deploy.
# 1. Install Python deps for the FastAPI server.
# 2. Install Node deps and build the React meal planner; vite drops the output
#    into server/static/meal-planner thanks to vite.config.ts.
# 3. Copy the static dashboard + login HTML/CSS/JS into server/static/.
# 4. Make sure the persistent image dir exists and seed it with the repo's
#    bundled seeded images on first deploy (rsync is idempotent).
set -euo pipefail

echo "==> Installing Python deps"
pip install -r server/requirements.txt

echo "==> Installing Node deps for meal planner"
cd apps/meal-planner
npm ci
echo "==> Building meal planner frontend"
npm run build
cd ../..

echo "==> Installing Node deps for budget tracker"
cd apps/budget
npm ci
echo "==> Building budget tracker frontend"
npm run build
cd ../..

echo "==> Installing Node deps for fitness tracker"
cd apps/fitness
npm ci
echo "==> Building fitness tracker frontend"
npm run build
cd ../..

echo "==> Installing Node deps for travel planner"
cd apps/travel-planner
npm ci
echo "==> Building travel planner frontend"
npm run build
cd ../..

echo "==> Installing Node deps for grade calculator"
cd apps/grades
npm ci
echo "==> Building grade calculator frontend"
npm run build
cd ../..

echo "==> Installing Node deps for journal"
cd apps/journal
npm ci
echo "==> Building journal frontend"
npm run build
cd ../..

echo "==> Copying dashboard static files"
mkdir -p server/static/dashboard server/static/login
cp -r dashboard/dashboard/. server/static/dashboard/
cp -r dashboard/login/.     server/static/login/

echo "==> Ensuring persistent dirs exist"
mkdir -p /var/data/images/custom /var/data/images/seeded || true

echo "==> Seeding bundled images (skips existing files)"
if [ -d server/images/seeded ]; then
  rsync -a --ignore-existing server/images/seeded/ /var/data/images/seeded/ || true
fi

echo "==> Build complete"
