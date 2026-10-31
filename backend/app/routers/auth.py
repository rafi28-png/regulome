"""
ReguloMe — Authentication Router
Signup, login, and user profile endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.responses import SignupRequest, LoginRequest, AuthResponse
from app.core.security import TokenData, get_current_user
from app.core.database import get_db
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user account (persisted to SQLite)."""
    return AuthService.signup(request, db)


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and receive a JWT token."""
    return AuthService.login(request, db)


@router.get("/me")
async def get_profile(user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current user's profile (requires authentication)."""
    profile = AuthService.get_by_id(user.user_id, db)
    return profile or {"user_id": user.user_id, "email": user.email}
