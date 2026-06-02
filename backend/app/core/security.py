from datetime import datetime, timezone
from hashlib import sha256


def verify_demo_credentials(username: str, password: str) -> bool:
    return bool(username.strip()) and password == "demo123"


def create_demo_token(username: str) -> str:
    issued_at = datetime.now(timezone.utc).isoformat()
    return sha256(f"{username}:{issued_at}:demo".encode("utf-8")).hexdigest()
