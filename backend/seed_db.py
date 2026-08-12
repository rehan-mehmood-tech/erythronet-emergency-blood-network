"""
ErythroNet Database Seeder
Drops and recreates all tables, then inserts demo seed data.
Run: python seed_db.py  (from /backend directory)
"""
import time
import json
import sys
import os

# Ensure we can import the app package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import BloodRequest, Donor

def seed():
    print("[SEED] Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)

    print("[SEED] Creating tables from SQLAlchemy models...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = time.time()

    # ── Demo Blood Requests ──────────────────────────────────────────────────
    requests = [
        BloodRequest(
            id="req-001",
            patient_name="Kashif Ali",
            hospital="Jinnah Hospital",
            ward="Ward 3, Bed 12",
            city="Lahore",
            district="Lahore Cantonment",
            blood_group="O+",
            units=2,
            medical_context="Trauma Accident",
            urgency="critical",
            status="awaiting",
            phone="03001234567",
            slip_url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
            created_at=now - 12 * 60,
        ),
        BloodRequest(
            id="req-002",
            patient_name="Zainab Bibi",
            hospital="Services Hospital",
            ward="ICU Floor 2",
            city="Lahore",
            district="Gulberg, Lahore",
            blood_group="B-",
            units=1,
            medical_context="Emergency Surgery",
            urgency="critical",
            status="en-route",
            phone="03119876543",
            slip_url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
            created_at=now - 28 * 60,
            donor_name="Ahmed K.",
            donor_eta="20 min",
            accepted_by_donor_id="donor-123",
            accepted_at=now - 5 * 60,
            lock_expires_at=now + 85 * 60,
        ),
        BloodRequest(
            id="req-003",
            patient_name="Muhammad Rizwan",
            hospital="Aga Khan Hospital",
            ward="Surgical Ward, Bed 5",
            city="Karachi",
            district="Karachi South",
            blood_group="A+",
            units=3,
            medical_context="Thalassemia Major",
            urgency="urgent",
            status="awaiting",
            phone="03214567890",
            slip_url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
            created_at=now - 5 * 60,
        ),
        BloodRequest(
            id="req-004",
            patient_name="Sajid Mahmood",
            hospital="PIMS Hospital",
            ward="Burns Unit, Bed 3",
            city="Islamabad",
            district="G-8, Islamabad",
            blood_group="AB+",
            units=2,
            medical_context="Severe Burns",
            urgency="critical",
            status="awaiting",
            phone="03335551212",
            slip_url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
            created_at=now - 3 * 60,
        ),
        BloodRequest(
            id="req-005",
            patient_name="Mariam Fatima",
            hospital="Mayo Hospital",
            ward="Maternity Ward, Bed 8",
            city="Lahore",
            district="Old Anarkali, Lahore",
            blood_group="O-",
            units=1,
            medical_context="Obstetric Emergency",
            urgency="urgent",
            status="fulfilled",
            phone="03457778899",
            slip_url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
            created_at=now - 120 * 60,
            donor_name="Bilal A.",
            accepted_by_donor_id="donor-456",
            accepted_at=now - 90 * 60,
        ),
    ]

    # ── Demo Donor ───────────────────────────────────────────────────────────
    donors = [
        Donor(
            uid="donor-123",
            name="Ahmed Khan",
            phone="03009999999",
            city="Lahore",
            district="Lahore Cantonment",
            blood_group="O+",
            notifications=json.dumps(["WhatsApp", "SMS"]),
            last_donation="2026-07-12",
            total_donations=3,
            registered_at=now - 30 * 24 * 60 * 60,
        ),
    ]

    db.add_all(requests)
    db.add_all(donors)
    db.commit()
    db.close()

    print(f"[SEED] OK - Seeded {len(requests)} blood requests and {len(donors)} donors.")
    print("[SEED] Database is ready at erythronet.db")


if __name__ == "__main__":
    seed()
