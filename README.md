# Brummer

Personal dashboard that hosts Matthew's apps behind a single sign-in. Currently just the Meal Planner. Add more apps by dropping a tile into `dashboard/dashboard/apps.js`.

## Architecture

```
brummerm/Brummer/
├── server/                 FastAPI app (auth + Meal Planner API + serves static frontends)
│   ├── app/
│   │   ├── main.py         Top-level FastAPI app, mounts everything
│   │   ├── auth.py         JWT-in-cookie auth, single user
│   │   ├── config.py       Settings, all overridable via env vars
│   │   ├── database.py
│   │   ├── models/         SQLAlchemy models (recipes, meal plans)
│   │   ├── schemas/        Pydantic schemas
│   │   ├── crud/           DB queries
│   │   ├── services/       Business logic (image handling, MealDB import, etc.)
│   │   ├── routers/        API endpoints (recipes, meal plans, grocery, etc.)
│   │   └── static/         Built frontends land here at deploy time
│   ├── images/             Local dev image storage (overridden by IMAGES_DIR env on Render)
│   ├── requirements.txt
│   └── run.py
├── dashboard/              Plain HTML/CSS/JS, no build step
│   ├── login/              Login page (public)
│   └── dashboard/          Tile grid (auth required)
├── apps/
│   └── meal-planner/       React/Vite source for the Meal Planner UI
├── scripts/
│   └── hash_password.py    Helper to generate AUTH_PASSWORD_HASH
├── build.sh                Render build script
├── render.yaml             Render service definition
└── start-dev.bat           Local dev runner (Windows)
```

Everything is one Render web service. The FastAPI server serves the API and the built static frontends from the same origin, so cookie auth works without CORS gymnastics.

## Local development (Windows)

One-time setup:

```cmd
cd server
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt

cd ..\apps\meal-planner
npm install
```

Generate a password hash and put it in `server\.env`:

```cmd
cd server
.venv\Scripts\python ..\scripts\hash_password.py
```

Create `server\.env`:

```
AUTH_PASSWORD_HASH=<paste hash from above>
JWT_SECRET=<any long random string, e.g. from python -c "import secrets; print(secrets.token_hex(32))">
```

Then run everything:

```cmd
start-dev.bat
```

Open http://localhost:8000 and sign in as `brummerm`. The Vite dev server runs at http://localhost:5173 and proxies API calls to the FastAPI server, so you get hot reload while developing the Meal Planner UI.

## Deploy to Render

1. Create the GitHub repo `brummerm/Brummer` (already done) and push this folder to it.
2. In Render, click **New > Blueprint** and point it at the GitHub repo. Render reads `render.yaml` and creates the service plus the persistent disk.
3. In the new service's **Environment** tab, set the two secret env vars:
   - `AUTH_PASSWORD_HASH`: bcrypt hash from `scripts/hash_password.py`
   - `JWT_SECRET`: long random string (`python -c "import secrets; print(secrets.token_hex(32))"`)
4. Trigger the first deploy. Build takes ~3 to 5 minutes (Python deps + npm install + Vite build).
5. Once live, open the Render-provided URL, sign in as `brummerm`, then go to **Settings** in the Meal Planner and click **Import Recipes Now** to seed about 200 recipes from TheMealDB. This only needs to happen once because the data lives on the persistent disk.

### Free tier caveats

- The web service sleeps after about 15 minutes of inactivity. The first request after a long idle period takes 30 to 60 seconds to wake up.
- The 1 GB persistent disk costs about $1/month after the free trial period. Without it, the SQLite database and uploaded images would reset on every deploy.

## Adding a new app

1. Build the app inside `apps/<your-app>/`, or wire its API routes into `server/app/routers/`.
2. Add an entry to `dashboard/dashboard/apps.js`:
   ```js
   {
     id: "your-app",
     title: "Your App",
     desc: "Short description.",
     icon: "🛠",
     href: "/apps/your-app/",
     enabled: true,
   }
   ```
3. If the new app has its own React/Vite frontend, copy the Meal Planner's vite.config.ts pattern: set `base: '/apps/your-app/'` and `outDir: '../../server/static/your-app'`. Then add a `mount` line in `server/app/main.py` and an `npm run build` step in `build.sh`.
4. If the new app needs API routes, add a router under `server/app/routers/` and include it in `main.py` with `dependencies=auth_dep` so it's protected by the same login.

## Auth model

One user, configured in env vars. Username defaults to `brummerm`. Login posts to `/api/auth/login`, which verifies the bcrypt hash and sets an HTTP-only cookie containing a signed JWT (HS256, 30 day TTL). All API routes except `/api/auth/login` and `/api/health` require that cookie. The Meal Planner's axios client sends the cookie automatically and bounces to `/login` on 401.

The plaintext password is never stored in the repo. Only the bcrypt hash, set as a Render env var.
