"""Smoke test for auth flow. Run from server/ with the venv active."""
import os, sys

# Test config: write to /tmp so we don't touch the real disk
os.environ["DATABASE_URL"] = "sqlite:////tmp/test_brummer.db"
os.environ["IMAGES_DIR"] = "/tmp/test_brummer_images"
os.environ["STATIC_DIR"] = "/tmp/test_brummer_static"
os.environ["JWT_SECRET"] = "testsecret"

# Set up a known password
from app.auth import hash_password
test_pw = "F22plane!"
os.environ["AUTH_PASSWORD_HASH"] = hash_password(test_pw)

# Force a fresh settings load
from app.config import Settings
import app.config
app.config.settings = Settings()
import app.auth
app.auth.settings = app.config.settings

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def expect(cond, msg):
    print(("OK  " if cond else "FAIL ") + msg)
    if not cond:
        sys.exit(1)

# 1. Public endpoints
r = client.get("/api/health")
expect(r.status_code == 200 and r.json()["status"] == "ok", "GET /api/health -> 200")

# 2. Protected endpoint without cookie -> 401
r = client.get("/api/recipes")
expect(r.status_code == 401, "GET /api/recipes without auth -> 401")

# 3. /api/auth/me without cookie -> 401
r = client.get("/api/auth/me")
expect(r.status_code == 401, "GET /api/auth/me without auth -> 401")

# 4. Bad login -> 401
r = client.post("/api/auth/login", json={"username": "brummerm", "password": "wrong"})
expect(r.status_code == 401, "Bad password -> 401")

# 5. Good login -> 200, sets cookie
r = client.post("/api/auth/login", json={"username": "brummerm", "password": test_pw})
expect(r.status_code == 200 and r.json()["ok"] is True, "Good login -> 200")
cookies = r.cookies
expect("brummer_session" in cookies, "Login sets brummer_session cookie")

# 6. /api/auth/me with cookie -> 200
client.cookies.update(cookies)
r = client.get("/api/auth/me")
expect(r.status_code == 200 and r.json()["username"] == "brummerm", "GET /api/auth/me with cookie -> 200")

# 7. Protected endpoint with cookie -> 200 (will hit the recipes router; empty list OK)
r = client.get("/api/recipes")
expect(r.status_code == 200, f"GET /api/recipes with auth -> 200 (got {r.status_code})")

# 8. Root redirects appropriately
r = client.get("/", follow_redirects=False)
expect(r.status_code in (302, 307) and "/dashboard" in r.headers.get("location", ""),
       "GET / when authed -> redirect to /dashboard")

# 9. Logout clears cookie
r = client.post("/api/auth/logout")
expect(r.status_code == 200, "Logout -> 200")
client.cookies.clear()

# 10. After logout, root redirects to /login
r = client.get("/", follow_redirects=False)
expect(r.status_code in (302, 307) and "/login" in r.headers.get("location", ""),
       "GET / when not authed -> redirect to /login")

print()
print("All smoke tests passed.")
