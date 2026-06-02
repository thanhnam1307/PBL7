from fastapi import APIRouter, HTTPException

from app.core.security import create_demo_token, verify_demo_credentials
from app.schemas.user_schema import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    if not verify_demo_credentials(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Invalid demo credentials")

    return TokenResponse(
        access_token=create_demo_token(payload.username),
        token_type="bearer",
        user={"username": payload.username, "role": "demo"},
    )
