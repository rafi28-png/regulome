"""
SETTINGS ROUTER
Allows user to configure NCBI API key from the UI.
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, TokenData
from app.core import config

router = APIRouter(prefix="/settings", tags=["settings"])


class NcbiKeyIn(BaseModel):
    api_key: str


@router.post("/ncbi-key")
async def set_ncbi_key(
    data: NcbiKeyIn,
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    key = data.api_key.strip()
    if not key:
        raise HTTPException(400, "Key cannot be empty")

    # Apply immediately in memory
    config.settings.NCBI_API_KEY = key

    # Try to persist to .env file
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
    try:
        lines = []
        if os.path.exists(env_path):
            with open(env_path) as f:
                lines = f.readlines()
        updated = False
        new_lines = []
        for line in lines:
            if line.startswith("NCBI_API_KEY="):
                new_lines.append(f"NCBI_API_KEY={key}\n")
                updated = True
            else:
                new_lines.append(line)
        if not updated:
            new_lines.append(f"\nNCBI_API_KEY={key}\n")
        with open(env_path, "w") as f:
            f.writelines(new_lines)
    except Exception as e:
        return {"success": True, "note": f"Key set in memory only. Could not write .env: {e}"}

    return {"success": True, "message": "NCBI API key saved. Faster analysis enabled."}


@router.get("/status")
async def get_settings_status(
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "ncbi_key_configured": bool(config.settings.NCBI_API_KEY),
        "max_variants": config.settings.MAX_VARIANTS,
    }
