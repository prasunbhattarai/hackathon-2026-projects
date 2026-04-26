import os
import sys
import uuid
from datetime import date, datetime, timedelta, timezone

# Add the project root to sys.path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.models.base import Base
from app.models.clinic import Clinic
from app.models.user import User
from app.models.patient import Patient
from app.models.case import Case
from app.schemas.enums import UserRole, Gender, CaseStatus, ImageQuality, PriorityTier


def seed_database():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        print("Starting seed process...")
        
        # 1. Create a Clinic
        clinic_id = uuid.uuid4()
        clinic = Clinic(
            id=clinic_id,
            name="Kathmandu Eye Care",
            address="Tripureshwor, Kathmandu",
            phone="+977-1-4000000",
            is_active=True,
        )
        db.add(clinic)
        print(f"Created clinic: {clinic.name}")

        # 2. Create Users (Super Admin and Doctor)
        admin_id = uuid.uuid4()
        admin = User(
            id=admin_id,
            email="admin@fundus.ai",
            full_name="Super Admin",
            role=UserRole.SUPER_ADMIN.value,
            clinic_id=None,
            is_active=True,
        )
        db.add(admin)
        print(f"Created admin user: {admin.email}")

        doctor_id = uuid.uuid4()
        doctor = User(
            id=doctor_id,
            email="doctor@fundus.ai",
            full_name="Dr. Ram Shrestha",
            role=UserRole.DOCTOR.value,
            clinic_id=clinic_id,
            is_active=True,
        )
        db.add(doctor)
        print(f"Created doctor user: {doctor.email}")

        db.flush() # flush to get IDs

        # 3. Create Patients
        patients_data = [
            ("Purna Bahadur", date(1950, 5, 12), Gender.MALE.value, "+977-9841000001", "KEC-001"),
            ("Sita Thapa", date(1965, 8, 22), Gender.FEMALE.value, "+977-9841000002", "KEC-002"),
            ("Hari Maharjan", date(1955, 3, 10), Gender.MALE.value, "+977-9841000003", "KEC-003"),
            ("Maya Gurung", date(1970, 11, 5), Gender.FEMALE.value, "+977-9841000004", "KEC-004"),
            ("Gopal Sharma", date(1945, 1, 30), Gender.MALE.value, "+977-9841000005", "KEC-005"),
        ]

        patients = []
        for name, dob, gender, phone, med_id in patients_data:
            p = Patient(
                id=uuid.uuid4(),
                clinic_id=clinic_id,
                full_name=name,
                date_of_birth=dob,
                gender=gender,
                contact_phone=phone,
                medical_id=med_id,
                created_by=doctor_id,
            )
            patients.append(p)
            db.add(p)
        print(f"Created {len(patients)} patients")

        db.flush()

        # 4. Create Cases
        # Distribute some cases across patients
        cases_data = [
            (patients[0].id, CaseStatus.APPROVED.value, PriorityTier.HIGH.value, 0.85, "https://res.cloudinary.com/demo/image/upload/sample.jpg"),
            (patients[0].id, CaseStatus.PROCESSING.value, PriorityTier.MEDIUM.value, 0.55, "https://res.cloudinary.com/demo/image/upload/sample.jpg"),
            (patients[1].id, CaseStatus.AWAITING_REVIEW.value, PriorityTier.CRITICAL.value, 0.95, "https://res.cloudinary.com/demo/image/upload/sample.jpg"),
            (patients[2].id, CaseStatus.APPROVED.value, PriorityTier.LOW.value, 0.15, "https://res.cloudinary.com/demo/image/upload/sample.jpg"),
            (patients[2].id, CaseStatus.REJECTED.value, PriorityTier.LOW.value, 0.05, "https://res.cloudinary.com/demo/image/upload/sample.jpg"),
            (patients[3].id, CaseStatus.AWAITING_REVIEW.value, PriorityTier.MEDIUM.value, 0.65, "https://res.cloudinary.com/demo/image/upload/sample.jpg"),
            (patients[4].id, CaseStatus.APPROVED.value, PriorityTier.HIGH.value, 0.75, "https://res.cloudinary.com/demo/image/upload/sample.jpg"),
        ]

        cases = []
        for i, (p_id, status, tier, score, url) in enumerate(cases_data):
            c = Case(
                id=uuid.uuid4(),
                patient_id=p_id,
                clinic_id=clinic_id,
                submitted_by=doctor_id,
                image_url=url,
                image_quality=ImageQuality.GOOD.value,
                status=status,
                priority_score=score,
                priority_tier=tier,
                task_id=f"dummy-task-{i}",
                created_at=datetime.now(timezone.utc) - timedelta(days=len(cases_data)-i),
            )
            cases.append(c)
            db.add(c)
        
        print(f"Created {len(cases)} cases")

        db.commit()
        print("Seed process completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"An error occurred during seeding: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
