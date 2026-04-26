from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "FundusAI Backend"
    APP_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/fundusai"

    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    REDIS_URL: str = "redis://localhost:6379/0"

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    UPLOAD_MAX_SIZE_MB: int = 10
    UPLOAD_MIN_DIMENSION_PX: int = 224
    UPLOAD_ALLOWED_MIME_TYPES: list[str] = ["image/jpeg", "image/png"]

    PDF_DOWNLOAD_EXPIRY_SECONDS: int = 3600

    # AI integration settings (backend orchestrates calls into ../ai)
    AI_ENABLE_QUALITY_GATE: bool = True
    AI_QUALITY_GATE_MODULE: str = "preprocessing.quality"
    AI_QUALITY_GATE_FUNCTION: str = "run_quality_check"
    # Post-prediction non-fundus rejection: if all 3 disease probabilities are
    # below this threshold the image is treated as a non-fundus / ineligible image.
    AI_NON_FUNDUS_THRESHOLD: float = 0.1

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
