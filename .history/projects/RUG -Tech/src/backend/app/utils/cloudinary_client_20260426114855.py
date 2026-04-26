"""
Cloudinary upload/delete helpers.

Keeps all Cloudinary SDK calls in one place so the rest of the app
remains testable without a live Cloudinary account.
"""

from __future__ import annotations

import cloudinary
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


def delete_image(public_id: str) -> dict:
    """
    Delete an image from Cloudinary by its public_id.
    Used when a case is abandoned / upload fails after DB write.
    """
    _configure()
    return cloudinary.uploader.destroy(public_id, resource_type="image")
