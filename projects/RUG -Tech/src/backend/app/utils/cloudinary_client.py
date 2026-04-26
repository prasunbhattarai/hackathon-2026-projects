"""
Cloudinary upload/delete helpers.

Keeps all Cloudinary SDK calls in one place so the rest of the app
remains testable without a live Cloudinary account.
"""

from __future__ import annotations

from datetime import datetime, timezone

import cloudinary
import cloudinary.utils
import cloudinary.uploader
from fastapi import UploadFile

from app.core.config import get_settings

_configured = False


def _configure() -> None:
    global _configured
    if _configured:
        return
    s = get_settings()
    cloudinary.config(
        cloud_name=s.CLOUDINARY_CLOUD_NAME,
        api_key=s.CLOUDINARY_API_KEY,
        api_secret=s.CLOUDINARY_API_SECRET,
        secure=True,
    )
    _configured = True


def upload_image(file: UploadFile, folder: str = "fundusai/fundus") -> dict:
    """
    Upload a fundus image to Cloudinary.

    Returns a dict with at minimum:
      - ``secure_url``   — HTTPS URL usable as image_url
      - ``public_id``    — identifier for future deletes/transformations

    Raises ``cloudinary.exceptions.Error`` on upload failure.
    """
    _configure()
    file.file.seek(0)
    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        resource_type="image",
        allowed_formats=["jpg", "jpeg", "png"],
        # Eager transformations: keep original + generate 512-px thumbnail
        eager=[{"width": 512, "crop": "limit", "quality": "auto"}],
        eager_async=True,
    )
    return result


def upload_local_file(file_path: "Path", folder: str = "fundusai/heatmaps") -> dict:
    """
    Upload a local image file (e.g. AI-generated heatmap) to Cloudinary.

    Returns the Cloudinary upload result dict (keys: secure_url, public_id, …).
    The caller is responsible for deleting the local file afterwards.
    """
    from pathlib import Path as _Path  # local import avoids circular at module level

    _configure()
    with open(_Path(file_path), "rb") as fh:
        result = cloudinary.uploader.upload(
            fh,
            folder=folder,
            resource_type="image",
        )
    return result


def delete_image(public_id: str) -> dict:
    """
    Delete an image from Cloudinary by its public_id.
    Used when a case is abandoned / upload fails after DB write.
    """
    _configure()
    return cloudinary.uploader.destroy(public_id, resource_type="image")


def upload_pdf(pdf_bytes: bytes, public_id: str) -> dict:
    """
    Upload a generated report PDF as a raw Cloudinary asset.
    """
    _configure()
    return cloudinary.uploader.upload(
        pdf_bytes,
        resource_type="raw",
        public_id=public_id,
        format="pdf",
        type="authenticated",
        overwrite=True,
    )


def build_signed_raw_url(
    public_id: str,
    expires_at: datetime,
    file_format: str = "pdf",
) -> str:
    """
    Build a short-lived signed URL for a Cloudinary raw asset.
    """
    _configure()
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    timestamp = int(expires_at.timestamp())
    url, _ = cloudinary.utils.cloudinary_url(
        f"{public_id}.{file_format}",
        resource_type="raw",
        type="authenticated",
        sign_url=True,
        expires_at=timestamp,
    )
    return url
