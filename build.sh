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

echo "==> Installing Playwright Chromium browser"
python -m playwright install chromium

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

echo "==> Copying workout tracker static app"
rm -rf server/static/fitness
mkdir -p server/static/fitness
cp -r apps/fitness/static/. server/static/fitness/

echo "==> Installing Node deps for travel planner"
cd apps/travel-planner
npm ci
echo "==> Building travel planner frontend"
npm run build
cd ../..

echo "==> Installing Node deps for tickets app"
cd apps/tickets
npm ci
echo "==> Building tickets app"
npm run build
cd ../..

echo "==> Installing Node deps for OSRS tracker"
cd apps/osrs
npm ci
echo "==> Building OSRS tracker"
npm run build
cd ../..

echo "==> Installing Node deps for Homes app"
cd apps/homes
npm ci
echo "==> Building Homes app"
npm run build
cd ../..

echo "==> Copying dashboard static files"
mkdir -p server/static/dashboard server/static/login
cp -r dashboard/dashboard/. server/static/dashboard/
cp -r dashboard/login/.     server/static/login/

echo "==> Stamping app links with build version (busts browser cache on every deploy)"
# Use git commit hash if available, otherwise fall back to unix timestamp.
BUILD_VERSION=$(git rev-parse --short HEAD 2>/dev/null || date +%s)
python3 - <<PYEOF
import re, pathlib

# 1. Stamp app hrefs inside apps.js
apps_path = pathlib.Path("server/static/dashboard/apps.js")
text = apps_path.read_text()
text = re.sub(r'(href: "/apps/[^/"]+/)(?:\?v=[^"]*)?(")', rf'\1?v=${BUILD_VERSION}\2', text)
apps_path.write_text(text)
print(f"  Stamped hrefs with v=${BUILD_VERSION}")

# 2. Stamp the apps.js script tag in index.html so the file itself is re-fetched
html_path = pathlib.Path("server/static/dashboard/index.html")
html = html_path.read_text()
html = re.sub(r'<script src="apps\.js(?:\?v=[^"]*)?">',
              f'<script src="apps.js?v=${BUILD_VERSION}">', html)
html_path.write_text(html)
print(f"  Stamped apps.js script tag with v=${BUILD_VERSION}")
PYEOF

echo "==> Ensuring persistent dirs exist"
mkdir -p /var/data/images/custom /var/data/images/seeded || true

echo "==> Seeding bundled images (skips existing files)"
if [ -d server/images/seeded ]; then
  rsync -a --ignore-existing server/images/seeded/ /var/data/images/seeded/ || true
fi

echo "==> Build complete"
