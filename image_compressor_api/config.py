import os
from dotenv import load_dotenv

load_dotenv()

def _parse_origins(raw: str) -> list:
    """Split a comma-separated origins string into a list, stripping whitespace."""
    return [o.strip() for o in raw.split(",") if o.strip()]

class Config:
    # Database
    DB_HOST     = os.getenv("DB_HOST", "localhost")
    DB_USER     = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME     = os.getenv("DB_NAME", "image_compressor")

    # CORS — comma-separated list of allowed origins.
    # Default includes the production Vercel URL and local dev.
    ALLOWED_ORIGINS = _parse_origins(
        os.getenv(
            "ALLOWED_ORIGINS",
            "https://image-compressor-rho-three.vercel.app,http://localhost:5173"
        )
    )

    # Application
    SECRET_KEY     = os.getenv("SECRET_KEY", "change-me-in-production")
    UPLOAD_FOLDER  = os.getenv("UPLOAD_FOLDER", "uploads/originals")
    COMPRESSED_FOLDER = os.getenv("COMPRESSED_FOLDER", "compressed/output")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024   # 16 MB upload limit

    # AI Service
    HF_TOKEN = os.getenv("HF_TOKEN", "")
