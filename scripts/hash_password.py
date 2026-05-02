"""
Generate a bcrypt hash of a password to paste into Render's AUTH_PASSWORD_HASH env var.

Usage:
    cd server
    python -m venv .venv
    .venv\\Scripts\\pip install -r requirements.txt   (Windows)
    .venv\\Scripts\\python ..\\scripts\\hash_password.py

It prompts for the password (no echo) and prints the hash. Copy the output
into the AUTH_PASSWORD_HASH env var in the Render dashboard.

Reason for being a separate script: we never want the plaintext password
committed anywhere in the repo, even in a comment.
"""
import getpass
from passlib.context import CryptContext

ctx = CryptContext(schemes=["bcrypt"])

if __name__ == "__main__":
    pw1 = getpass.getpass("Password: ")
    pw2 = getpass.getpass("Confirm:  ")
    if pw1 != pw2:
        raise SystemExit("Passwords did not match.")
    if not pw1:
        raise SystemExit("Password cannot be empty.")
    print()
    print("Bcrypt hash (paste into AUTH_PASSWORD_HASH):")
    print(ctx.hash(pw1))
