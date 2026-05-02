"""
Single-user authentication using a bcrypt-hashed password and a JWT in an HTTP-only cookie.

Why not OAuth or Firebase: this site has exactly one user (Matthew). Adding a third-party
auth provider would be more moving parts than the threat model justifies. A bcrypt hash
stored in an env var on Render plus a signed cookie is appropriate for a personal dashboard.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, Request, status
from fastapi.responses import RedirectResponse
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

from .config import settings

# bcrypt context. We never write plaintext passwords to disk; only the hash is stored
# (in the AUTH_PASSWORD_HASH env var on Render).
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


def verify_password(plain: str, hashed: str) -> bool:
    if not hashed:
        return False
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def create_session_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(seconds=settings.JWT_TTL_SECONDS)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_session_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


def get_current_user(request: Request) -> str:
    """
    Dependency that returns the username if a valid session cookie is present,
    otherwise raises 401. Use this on every protected API route.
    """
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_session_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid session")
    return payload["sub"]


def is_authenticated(request: Request) -> bool:
    """Non-raising check — used by the static page guard."""
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        return False
    payload = decode_session_token(token)
    return bool(payload and "sub" in payload)


# ---- Routes ----

@router.post("/login")
def login(payload: LoginRequest, response: Response):
    """
    Verify username + password against the configured hash. On success, set the
    session cookie and return ok. The cookie is HTTP-only so JS in the browser
    cannot read it; the browser sends it automatically on subsequent requests.
    """
    if payload.username != settings.AUTH_USERNAME:
        # Same response as bad password to avoid leaking which one was wrong
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, settings.AUTH_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_session_token(payload.username)
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        max_age=settings.JWT_TTL_SECONDS,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite="lax",
    )
    return {"ok": True, "username": payload.username}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(settings.SESSION_COOKIE_NAME)
    return {"ok": True}


@router.get("/me")
def me(username: str = Depends(get_current_user)):
    return {"username": username}
