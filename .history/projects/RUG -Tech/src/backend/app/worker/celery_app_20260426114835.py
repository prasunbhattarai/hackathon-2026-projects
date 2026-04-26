"""
Celery application factory.

Broker and result backend both use Redis.
The worker is started separately:
    celery -A app.worker.celery_app worker --loglevel=info
"""

from celery import Celery

from app.core.config import get_settings


def create_celery() -> Celery:
    settings = get_settings()

    app = Celery(
        "fundusai",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
    )

    app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_acks_late=True,          # re-queue on worker crash
        worker_prefetch_multiplier=1,  # one task per worker at a time (GPU jobs)
        result_expires=86400,          # 24 h
        task_routes={
            "app.worker.tasks.run_analysis": {"queue": "analysis"},
        },
    )

    # Auto-discover tasks in app/worker/tasks.py
    app.autodiscover_tasks(["app.worker"])

    return app


celery_app = create_celery()
