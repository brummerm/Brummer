"""
Top-level FastAPI app for the Brummer personal dashboard.

Layout served at runtime:
  /                          -> redirect to /login if not authed, else /dashboard/
  /login                     -> static login page
  /dashboard/...             -> static dashboard files (the tile grid)
  /apps/meal-planner/..      -> built React app for the meal planner
  /apps/budget/...           -> built React app for the budget tracker
  /apps/fitness/...          -> built React app for the fitness tracker
  /apps/travel-planner/...   -> built React app for travel planner
  /apps/tickets/...          -> built React app for home tickets
  /api/auth/...              -> login/logout/me
  /api/travel/...            -> travel planner API (auth required)
  /images/...                -> recipe images (auth required)
"""
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse

from .config import settings
from .database import Base, engine, SessionLocal
from . import models  # noqa: F401 — registers ORM tables before create_all
from .models import body_weight  # noqa: F401 — registers body_weights table
from .models import fitness  # noqa: F401 — registers workout tables
from .routers import recipes, ingredients, meal_plans, grocery, images, seed, budget, fitness, travel
from .routers import body_weight as body_weight_router
from .routers import tickets as tickets_router
from .crud import budget as budget_crud
from .crud import tickets as tickets_crud
from .crud import fitness as fitness_crud
from .auth import router as auth_router, get_current_user, is_authenticated
from sqlalchemy.orm import Session

# Create tables on startup
Base.metadata.create_all(bind=engine)


def migrate_recipe_nutrition(db: Session):
    from sqlalchemy import text, inspect
    inspector = inspect(db.bind)
    cols = {c['name'] for c in inspector.get_columns('recipes')}
    if 'calories' not in cols:
        db.execute(text("ALTER TABLE recipes ADD COLUMN calories REAL"))
    if 'protein_g' not in cols:
        db.execute(text("ALTER TABLE recipes ADD COLUMN protein_g REAL"))
    if 'carbs_g' not in cols:
        db.execute(text("ALTER TABLE recipes ADD COLUMN carbs_g REAL"))
    if 'fat_g' not in cols:
        db.execute(text("ALTER TABLE recipes ADD COLUMN fat_g REAL"))
    db.commit()


def migrate_meal_slot_source(db: Session):
    from sqlalchemy import text, inspect
    inspector = inspect(db.bind)
    cols = {c['name'] for c in inspector.get_columns('meal_slots')}
    if 'source_slot_id' not in cols:
        db.execute(text("ALTER TABLE meal_slots ADD COLUMN source_slot_id INTEGER REFERENCES meal_slots(id)"))
        db.commit()


def migrate_itinerary_notes(db: Session):
    from sqlalchemy import text, inspect
    inspector = inspect(db.bind)
    try:
        cols = {c['name'] for c in inspector.get_columns('itinerary_items')}
        if 'notes' not in cols:
            db.execute(text("ALTER TABLE itinerary_items ADD COLUMN notes TEXT DEFAULT ''"))
            db.commit()
    except Exception:
        db.rollback()


def migrate_household_settings_emails(db: Session):
    from sqlalchemy import text, inspect
    inspector = inspect(db.bind)
    try:
        cols = {c['name'] for c in inspector.get_columns('household_settings')}
        if 'member1_email' not in cols:
            db.execute(text("ALTER TABLE household_settings ADD COLUMN member1_email TEXT"))
        if 'member2_email' not in cols:
            db.execute(text("ALTER TABLE household_settings ADD COLUMN member2_email TEXT"))
        if 'notifications_enabled' not in cols:
            db.execute(text("ALTER TABLE household_settings ADD COLUMN notifications_enabled BOOLEAN DEFAULT 1"))
        db.commit()
    except Exception:
        db.rollback()


def migrate_completed_archive_column(db: Session):
    from sqlalchemy import text, inspect
    inspector = inspect(db.bind)
    try:
        cols = {c['name'] for c in inspector.get_columns('ticket_spaces')}
        if 'is_completed_archive' not in cols:
            db.execute(text("ALTER TABLE ticket_spaces ADD COLUMN is_completed_archive BOOLEAN DEFAULT 0"))
            db.commit()
    except Exception:
        db.rollback()


def migrate_meal_slots_flexible(db: Session):
    from sqlalchemy import text, inspect
    inspector = inspect(db.bind)
    try:
        cols = {c['name'] for c in inspector.get_columns('meal_slots')}
        if 'sort_order' in cols:
            return  # already migrated
        # Recreate table without UniqueConstraint, with sort_order
        db.execute(text("""
            CREATE TABLE meal_slots_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                week_plan_id INTEGER NOT NULL REFERENCES week_plans(id) ON DELETE CASCADE,
                day_of_week INTEGER NOT NULL,
                meal_type TEXT NOT NULL,
                slot_type TEXT NOT NULL DEFAULT 'empty',
                recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
                servings_override INTEGER,
                notes TEXT,
                source_slot_id INTEGER,
                sort_order INTEGER NOT NULL DEFAULT 0
            )
        """))
        db.execute(text("""
            INSERT INTO meal_slots_new
                (id, week_plan_id, day_of_week, meal_type, slot_type, recipe_id,
                 servings_override, notes, source_slot_id, sort_order)
            SELECT id, week_plan_id, day_of_week, meal_type, slot_type, recipe_id,
                   servings_override, notes, source_slot_id,
                   CASE meal_type WHEN 'breakfast' THEN 0 WHEN 'lunch' THEN 1
                                  WHEN 'dinner' THEN 2 ELSE 3 END
            FROM meal_slots
        """))
        db.execute(text("DROP TABLE meal_slots"))
        db.execute(text("ALTER TABLE meal_slots_new RENAME TO meal_slots"))
        db.execute(text("CREATE INDEX IF NOT EXISTS idx_meal_slots_week_plan_id ON meal_slots (week_plan_id)"))
        db.execute(text("CREATE INDEX IF NOT EXISTS idx_meal_slots_recipe_id ON meal_slots (recipe_id)"))
        db.commit()
    except Exception:
        db.rollback()
        raise


async def _periodic_archive_job(interval_seconds: int = 43200):
    """Run archive_old_completed_tickets every `interval_seconds` (default 12 h)."""
    while True:
        await asyncio.sleep(interval_seconds)
        db = SessionLocal()
        try:
            moved = tickets_crud.archive_old_completed_tickets(db)
            if moved:
                print(f"[archive-job] Moved {moved} completed ticket(s) to archive.")
        except Exception as exc:
            print(f"[archive-job] Error: {exc}")
            db.rollback()
        finally:
            db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        budget_crud.seed_defaults(db)
        budget_crud.migrate_data(db)
        migrate_recipe_nutrition(db)
        migrate_meal_slot_source(db)
        migrate_itinerary_notes(db)
        migrate_household_settings_emails(db)
        migrate_meal_slots_flexible(db)
        migrate_completed_archive_column(db)
        tickets_crud.seed_defaults(db)
        # Ensure the completed-archive space exists
        tickets_crud.get_or_create_completed_archive(db)
        # Run archival immediately on startup, then schedule periodic runs
        tickets_crud.archive_old_completed_tickets(db)
        fitness_crud.seed_warfighter_templates(db)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    # Start background archival task (every 12 hours)
    archive_task = asyncio.create_task(_periodic_archive_job())
    yield
    archive_task.cancel()
    try:
        await archive_task
    except asyncio.CancelledError:
        pass

# Make sure image directories exist
Path(settings.IMAGES_DIR, "custom").mkdir(parents=True, exist_ok=True)
Path(settings.IMAGES_DIR, "seeded").mkdir(parents=True, exist_ok=True)

# Make sure static dirs exist (so the app starts even before frontends are built)
STATIC_DIR = Path(settings.STATIC_DIR)
DASHBOARD_DIR = STATIC_DIR / "dashboard"
LOGIN_DIR = STATIC_DIR / "login"
MEAL_PLANNER_DIR = STATIC_DIR / "meal-planner"
BUDGET_DIR         = STATIC_DIR / "budget"
FITNESS_DIR        = STATIC_DIR / "fitness"
TRAVEL_DIR         = STATIC_DIR / "travel-planner"
TICKETS_DIR        = STATIC_DIR / "tickets"
for d in (DASHBOARD_DIR, LOGIN_DIR, MEAL_PLANNER_DIR, BUDGET_DIR, FITNESS_DIR, TRAVEL_DIR, TICKETS_DIR):
    d.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="Brummer Personal Dashboard",
    description="Single-user dashboard hosting Matthew's personal apps.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS only matters for local dev when frontend runs on its own port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Auth router (always public, since this is where you log in) ----
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])


# ---- Health check (public) ----
@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---- Meal Planner API: every route requires a valid session cookie ----
auth_dep = [Depends(get_current_user)]
app.include_router(recipes.router,     prefix="/api/recipes",     dependencies=auth_dep)
app.include_router(ingredients.router, prefix="/api/ingredients", dependencies=auth_dep)
app.include_router(meal_plans.router,  prefix="/api/meal-plans",  dependencies=auth_dep)
app.include_router(grocery.router,     prefix="/api/grocery",     dependencies=auth_dep)
app.include_router(images.router,      prefix="/api/images",      dependencies=auth_dep)
app.include_router(seed.router,        prefix="/api/seed",        dependencies=auth_dep)

# ---- Budget API ----
app.include_router(budget.router,  prefix="/api/budget",  dependencies=auth_dep, tags=["budget"])

# ---- Fitness API ----
app.include_router(fitness.router, prefix="/api/fitness", dependencies=auth_dep, tags=["fitness"])

# ---- Travel Planner API ----
app.include_router(travel.router,  prefix="/api/travel",  dependencies=auth_dep, tags=["travel"])

# ---- Body Weight API ----
app.include_router(body_weight_router.router, prefix="/api", dependencies=auth_dep)

# ---- Tickets API ----
app.include_router(tickets_router.router, prefix="/api/tickets", dependencies=auth_dep, tags=["tickets"])


# ---- Image static mount, with auth gate ----
# StaticFiles can't easily depend on auth, so we wrap the path with a guard endpoint
# and then fall back to the static mount. Simpler: require auth via cookie check.
@app.get("/images/{path:path}")
def serve_image(path: str, request: Request, _: str = Depends(get_current_user)):
    # Resolve safely: prevent path traversal
    base = Path(settings.IMAGES_DIR).resolve()
    target = (base / path).resolve()
    if not str(target).startswith(str(base)):
        return HTMLResponse("Forbidden", status_code=403)
    if not target.is_file():
        return HTMLResponse("Not found", status_code=404)
    return FileResponse(target)


# ---- Static frontends ----
# The login page is the only static area that's public.
app.mount("/login", StaticFiles(directory=str(LOGIN_DIR), html=True), name="login")

# Dashboard uses StaticFiles (no deep client-side routes).
app.mount("/dashboard", StaticFiles(directory=str(DASHBOARD_DIR), html=True), name="dashboard")


# Serve React SPA apps: return the real file if it exists, otherwise index.html.
# This makes hard-refresh and direct URL navigation work with React Router.
_SPA_DIRS = {
    "meal-planner":  MEAL_PLANNER_DIR,
    "budget":        BUDGET_DIR,
    "fitness":       FITNESS_DIR,
    "travel-planner": TRAVEL_DIR,
    "tickets":       TICKETS_DIR,
}


@app.get("/apps/{app_name}/{full_path:path}")
@app.get("/apps/{app_name}/")
def serve_spa(app_name: str, full_path: str = ""):
    static_dir = _SPA_DIRS.get(app_name)
    if static_dir is None:
        return HTMLResponse("Not found", status_code=404)
    base = static_dir.resolve()
    target = (base / full_path).resolve()
    if str(target).startswith(str(base)) and target.is_file():
        return FileResponse(target)
    return FileResponse(base / "index.html")


@app.get("/")
def root(request: Request):
    if is_authenticated(request):
        return RedirectResponse("/dashboard/")
    return RedirectResponse("/login/")
