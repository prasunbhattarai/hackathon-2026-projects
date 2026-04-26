from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────────────────────
    APP_NAME: str = "FundusAI Backend"
    APP_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    # ── Database (Postgres / Neon / Supabase DB) ──────────────────────────────
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/fundusai"

    # ── Supabase Auth ─────────────────────────────────────────────────────────
    # JWKS URL: https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ── Redis / Celery ────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Cloudinary ────────────────────────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ── File Upload Constraints ───────────────────────────────────────────────
    UPLOAD_MAX_SIZE_MB: int = 10
    UPLOAD_MIN_DIMENSION_PX: int = 224
    UPLOAD_ALLOWED_MIME_TYPES: list[str] = ["image/jpeg", "image/png"]

    # ── PDF Generation ────────────────────────────────────────────────────────
    PDF_DOWNLOAD_EXPIRY_SECONDS: int = 3600

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


from functools import lru_cache  # noqa: E402


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings accessor for use as a FastAPI dependency."""
    return settings
