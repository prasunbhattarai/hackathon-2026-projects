"""Run idempotent development seed data for backend database."""

from __future__ import annotations

from app.db.seed import seed_dev_data
from app.db.session import SessionLocal


def main() -> None:
    with SessionLocal() as db:
        result = seed_dev_data(db)

    print("Seed completed successfully")
    print(f"clinicId={result['clinicId']}")
    print(f"adminUserId={result['adminUserId']} email={result['adminEmail']}")
    print(f"doctorUserId={result['doctorUserId']} email={result['doctorEmail']}")


if __name__ == "__main__":
    main()
