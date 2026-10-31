"""
ReguloMe — FastAPI Application
Next-generation regulatory genomics platform API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.middleware import RequestTimingMiddleware, DemoModeMiddleware
from app.core.database import init_db
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
)
from app.routers import bookmarks, genomics
from app.routers import (
    upload,
    real_dashboard,
    real_variants,
    real_expression,
    real_network,
    real_diseases,
    settings as settings_router,
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # ── Startup ──────────────────────────────────────────────────────────────
    print("")
    print("  +--------------------------------------------------+")
    print("  |              ReguloMe API Server                 |")
    print("  +--------------------------------------------------+")
    print(f"  |  Version:  {settings.APP_VERSION:<38} |")
    print(f"  |  Mode:     {'DEMO' if settings.DEMO_MODE else 'REAL':<38} |")
    print(f"  |  Debug:    {str(settings.DEBUG):<38} |")
    print(f"  |  Host:     {settings.HOST}:{settings.PORT:<32} |")
    print("  +--------------------------------------------------+")
    print(f"  |  Docs:     http://localhost:{settings.PORT}/docs{' ' * 18} |")
    print(f"  |  ReDoc:    http://localhost:{settings.PORT}/redoc{' ' * 17} |")
    print(f"  |  Health:   http://localhost:{settings.PORT}/api/v1/health{' ' * 9} |")
    print("  +--------------------------------------------------+")
    print("")

    # Initialise SQLite database (creates tables if they don't exist)
    init_db()

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    print(f"\n  [ReguloMe] Server shutting down gracefully...\n")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "ReguloMe — Next-generation platform for interpreting, visualizing, "
            "simulating, and optimizing the human non-coding regulatory genome.\n\n"
            "## API Sections\n"
            "- **Health**: Server status and diagnostics\n"
            "- **Genomics**: Real-time public API annotation (Ensembl, ClinVar, GTEx, Open Targets)\n"
            "- **Bookmarks**: Persistent variant bookmarks (SQLite)\n"
            "- **Personas**: Demo persona profiles\n"
            "- **Dashboard**: Aggregated persona overview\n"
            "- **Variants**: Regulatory variant explorer\n"
            "- **Expression**: Gene × Tissue expression landscape\n"
            "- **Network**: Regulatory network graph (D3.js)\n"
            "- **Diseases**: Disease & systems biology hub\n"
            "- **Epigenetic**: Epigenetic & regulatory clock\n"
            "- **Optimization**: Self-optimization studio\n"
            "- **Simulator**: Regulatory Twin what-if analysis\n"
            "- **Reports**: Multi-format report generation\n"
            "- **Auth**: User registration and authentication (SQLite)\n"
        ),
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # === CORS middleware ===
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # === Custom middleware ===
    app.add_middleware(RequestTimingMiddleware)
    app.add_middleware(DemoModeMiddleware)

    # === Exception handlers ===
    register_exception_handlers(app)

    # === Register routers ===
    API_PREFIX = "/api/v1"

    # Health & root
    app.include_router(health.router, prefix=API_PREFIX)
    app.include_router(health.router)  # root-level too

    # === Real-mode genomics endpoints (public APIs + SQLite cache) ===
    app.include_router(genomics.router, prefix=API_PREFIX)

    # === Persistent bookmarks (works in demo + real mode) ===
    app.include_router(bookmarks.router, prefix=API_PREFIX)

    # Auth (SQLite-backed)
    app.include_router(auth.router, prefix=API_PREFIX)

    # Core data endpoints
    app.include_router(personas.router, prefix=API_PREFIX)
    app.include_router(dashboard.router, prefix=API_PREFIX)
    app.include_router(variants.router, prefix=API_PREFIX)
    app.include_router(expression.router, prefix=API_PREFIX)
    app.include_router(network.router, prefix=API_PREFIX)

    # Domain modules
    app.include_router(diseases.router, prefix=API_PREFIX)
    app.include_router(epigenetic.router, prefix=API_PREFIX)
    app.include_router(optimization.router, prefix=API_PREFIX)
    app.include_router(simulator.router, prefix=API_PREFIX)

    # Power features
    app.include_router(reports.router, prefix=API_PREFIX)

    # === Real Mode routers (authenticated, genome-upload-required) ===
    app.include_router(upload.router, prefix=API_PREFIX)
    app.include_router(real_dashboard.router, prefix=API_PREFIX)
    app.include_router(real_variants.router, prefix=API_PREFIX)
    app.include_router(real_expression.router, prefix=API_PREFIX)
    app.include_router(real_network.router, prefix=API_PREFIX)
    app.include_router(real_diseases.router, prefix=API_PREFIX)
    app.include_router(settings_router.router, prefix=API_PREFIX)

    return app



# Create the app instance
app = create_app()
