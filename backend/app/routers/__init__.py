"""
ReguloMe — Routers Package
All API route modules.
"""
from app.routers import (
    health,
    personas,
    dashboard,
    variants,
    expression,
    network,
    diseases,
    epigenetic,
    optimization,
    simulator,
    reports,
    auth,
    bookmarks,
    genomics,
)

__all__ = [
    "health",
    "personas",
    "dashboard",
    "variants",
    "expression",
    "network",
    "diseases",
    "epigenetic",
    "optimization",
    "simulator",
    "reports",
    "auth",
    "bookmarks",
    "genomics",
]
