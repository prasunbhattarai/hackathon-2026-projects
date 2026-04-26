from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def safe_image_ext(content_type: str | None, filename: str | None) -> str:
    ct = (content_type or "").lower().strip()
    if ct in {"image/jpeg", "image/jpg"}:
        return ".jpg"
    if ct == "image/png":
        return ".png"
    name = (filename or "").lower()
    if name.endswith(".png"):
        return ".png"
    if name.endswith(".jpeg") or name.endswith(".jpg"):
        return ".jpg"
    return ".jpg"


def save_upload_image(
    image: UploadFile,
    *,
    target_dir: Path,
) -> tuple[str, Path]:
    """
    Save an uploaded image under target_dir.

    Returns:
      (relative_url_path, absolute_path)
    """
    ensure_dir(target_dir)
    ext = safe_image_ext(image.content_type, image.filename)
    name = f"{uuid.uuid4().hex}{ext}"
    out_path = target_dir / name

    image.file.seek(0)
    with open(out_path, "wb") as f:
        f.write(image.file.read())
    image.file.seek(0)

    # served by FastAPI StaticFiles at /static
    rel_url = f"/static/uploads/{name}"
    return rel_url, out_path

