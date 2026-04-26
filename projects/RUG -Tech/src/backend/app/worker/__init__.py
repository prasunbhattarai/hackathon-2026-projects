# Worker package — exports celery_app for convenience
from app.worker.celery_app import celery_app  # noqa: F401

__all__ = ["celery_app"]
