from pydantic_settings import BaseSettings
from pathlib import Path

# server/app/config.py -> parents[1] is server/
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # Database. On Render, override with a path on persistent disk like /var/data/meal_planner.db
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/meal_planner.db"

    # Where uploaded and seeded recipe images live. Override with /var/data/images on Render
    # so images survive deploys.
    IMAGES_DIR: str = str(BASE_DIR / "images")

    # Where the built static frontends live (dashboard + meal planner)
    STATIC_DIR: str = str(BASE_DIR / "static")

    MEALDB_BASE_URL: str = "https://www.themealdb.com/api/json/v1/1"
    SEED_MAX_PER_CATEGORY: int = 15
    MAX_IMAGE_SIZE_MB: int = 10

    # CORS only matters for local dev when frontend runs on its own port
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:8000",
    ]

    # ---- Auth ----
    # Single-user auth. Username is fixed. Password is provided as a bcrypt hash via env var.
    AUTH_USERNAME: str = "brummerm"
    # Default hash here is a placeholder that won't match anything useful; ALWAYS set this in env.
    AUTH_PASSWORD_HASH: str = ""
    # Secret used to sign session JWTs. MUST be overridden in production.
    JWT_SECRET: str = "dev-only-change-me"
    JWT_ALGORITHM: str = "HS256"
    # 30 days, since this is a personal app
    JWT_TTL_SECONDS: int = 60 * 60 * 24 * 30
    # Cookie name
    SESSION_COOKIE_NAME: str = "brummer_session"
    # Set to True on Render (HTTPS). Auto-detected via ENV
    SESSION_COOKIE_SECURE: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
