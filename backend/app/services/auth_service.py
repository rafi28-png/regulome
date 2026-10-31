"""
ReguloMe — Auth Service
Real user registration and login backed by SQLite.
Passwords are hashed with bcrypt. Accounts survive server restarts.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import AuthenticationError, DuplicateEmailError
from app.core.database import UserModel, get_db
from app.schemas.responses import SignupRequest, LoginRequest, AuthResponse


class AuthService:
    """Authentication service — signup, login, profile (SQLite-backed)."""

    @staticmethod
    def signup(request: SignupRequest, db: Session) -> AuthResponse:
        """Register a new user — persisted to SQLite."""
        email = request.email.lower().strip()

        # Check duplicate
        existing = db.query(UserModel).filter(UserModel.email == email).first()
        if existing:
            raise DuplicateEmailError(email)

        user_id = str(uuid.uuid4())
        hashed  = hash_password(request.password)

        user = UserModel(
            user_id=user_id,
            email=email,
            name=request.name.strip(),
            password_hash=hashed,
        )
        db.add(user)
        db.commit()

        token = create_access_token(user_id=user_id, email=email)
        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user_id=user_id,
            name=request.name.strip(),
            email=email,
        )

    @staticmethod
    def login(request: LoginRequest, db: Session) -> AuthResponse:
        """Authenticate and return JWT. Loads user from SQLite."""
        email = request.email.lower().strip()

        user = db.query(UserModel).filter(UserModel.email == email).first()
        if user is None:
            raise AuthenticationError("Invalid email or password")

        if not verify_password(request.password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        db.commit()

        token = create_access_token(user_id=user.user_id, email=email)
        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.user_id,
            name=user.name,
            email=email,
        )

    @staticmethod
    def get_by_id(user_id: str, db: Session) -> dict | None:
        """Look up a user by ID."""
        user = db.query(UserModel).filter(UserModel.user_id == user_id).first()
        if not user:
            return None
        return {"user_id": user.user_id, "email": user.email, "name": user.name}
