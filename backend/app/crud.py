"""
Firestore-backed CRUD operations.
Replaces the previous SQLAlchemy/SQLite implementation.
All public function signatures remain compatible with existing routers.
"""
import time
import uuid
from typing import Optional, List
from firebase_admin import firestore as fs

from .firestore import db
from . import schemas

# ── Collection references ─────────────────────────────────────────────────────
DONORS_COL = "donors"
REQUESTS_COL = "requests"


# ══════════════════════════════════════════════════════════════════════════════
# DONOR HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _donor_to_response(data: dict, uid: str) -> schemas.DonorResponse:
    notif = data.get("notifications", [])
    if isinstance(notif, str):
        import json
        try:
            notif = json.loads(notif)
        except Exception:
            notif = []
    return schemas.DonorResponse(
        uid=uid,
        name=data.get("name", ""),
        phone=data.get("phone", ""),
        city=data.get("city", ""),
        district=data.get("district", ""),
        blood_group=data.get("blood_group", ""),
        notifications=notif,
        last_donation=data.get("last_donation"),
        total_donations=data.get("total_donations", 0),
        registered_at=data.get("registered_at", time.time()),
    )


# ══════════════════════════════════════════════════════════════════════════════
# DONOR OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def get_donor(_db, uid: str):
    """Return donor dict-like object keyed by uid, or None."""
    doc = db.collection(DONORS_COL).document(uid).get()
    if not doc.exists:
        return None
    return _DonorProxy(doc.id, doc.to_dict())


def get_donor_by_phone(_db, phone: str):
    """Find a donor by phone number."""
    query = db.collection(DONORS_COL).where("phone", "==", phone).limit(1).stream()
    for doc in query:
        return _DonorProxy(doc.id, doc.to_dict())
    return None


def create_donor(_db, donor: schemas.DonorCreate):
    """Upsert donor document by uid (fixes duplicate-phone 400 on re-auth)."""
    now = time.time()
    data = {
        "uid": donor.uid,
        "name": donor.name,
        "phone": donor.phone,
        "city": donor.city,
        "district": donor.district,
        "blood_group": donor.blood_group,
        "notifications": donor.notifications,
        "last_donation": donor.last_donation,
        "total_donations": 0,
        "registered_at": now,
    }
    db.collection(DONORS_COL).document(donor.uid).set(data, merge=True)
    return _DonorProxy(donor.uid, data)


def format_donor_response(proxy) -> Optional[schemas.DonorResponse]:
    if proxy is None:
        return None
    return _donor_to_response(proxy._data, proxy._uid)


# ══════════════════════════════════════════════════════════════════════════════
# REQUEST HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _doc_to_request_response(doc_id: str, data: dict) -> schemas.BloodRequestResponse:
    return schemas.BloodRequestResponse(
        id=doc_id,
        patient_name=data.get("patient_name", ""),
        hospital=data.get("hospital", ""),
        ward=data.get("ward", ""),
        city=data.get("city", ""),
        district=data.get("district", ""),
        blood_group=data.get("blood_group", ""),
        units=data.get("units", 1),
        medical_context=data.get("medical_context", "General Emergency"),
        urgency=data.get("urgency", "critical"),
        status=data.get("status", "awaiting"),
        phone=data.get("phone", ""),
        slip_url=data.get("slip_url"),
        created_at=data.get("created_at", time.time()),
        donor_name=data.get("donor_name"),
        donor_eta=data.get("donor_eta"),
        accepted_by_donor_id=data.get("accepted_by_donor_id"),
        accepted_at=data.get("accepted_at"),
        lock_expires_at=data.get("lock_expires_at"),
    )


# ══════════════════════════════════════════════════════════════════════════════
# REQUEST OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def get_request(_db, request_id: str):
    doc = db.collection(REQUESTS_COL).document(request_id).get()
    if not doc.exists:
        return None
    return _RequestProxy(doc.id, doc.to_dict())


def get_requests(
    _db,
    skip: int = 0,
    limit: int = 100,
    city: Optional[str] = None,
    blood_group: Optional[str] = None,
    urgency: Optional[str] = None,
    status: Optional[str] = None,
) -> List[schemas.BloodRequestResponse]:
    query = db.collection(REQUESTS_COL).order_by(
        "created_at", direction=fs.Query.DESCENDING
    )
    if status and status != "all":
        query = query.where("status", "==", status)
    if blood_group and blood_group != "All":
        query = query.where("blood_group", "==", blood_group)

    docs = list(query.stream())

    results = []
    for doc in docs:
        data = doc.to_dict()
        # Client-side city/urgency filters (Firestore multi-field inequality is restricted)
        if city and city != "All Cities":
            city_lower = city.lower()
            if (
                city_lower not in data.get("city", "").lower()
                and city_lower not in data.get("district", "").lower()
                and city_lower not in data.get("hospital", "").lower()
            ):
                continue
        if urgency and urgency != "all":
            if data.get("urgency", "") != urgency:
                continue
        results.append(_doc_to_request_response(doc.id, data))

    return results[skip: skip + limit]


def create_blood_request(
    _db,
    request: schemas.BloodRequestCreate,
    id: str,
    slip_url: str,
) -> schemas.BloodRequestResponse:
    now = time.time()
    data = {
        "patient_name": request.patient_name,
        "hospital": request.hospital,
        "ward": request.ward,
        "city": request.city,
        "district": request.district,
        "blood_group": request.blood_group,
        "units": request.units,
        "medical_context": request.medical_context or "General Emergency",
        "urgency": request.urgency.lower(),
        "status": "awaiting",
        "phone": request.phone,
        "slip_url": slip_url,
        "created_at": now,
        "donor_name": None,
        "donor_eta": None,
        "accepted_by_donor_id": None,
        "accepted_at": None,
        "lock_expires_at": None,
    }
    db.collection(REQUESTS_COL).document(id).set(data)
    return _doc_to_request_response(id, data)


def accept_blood_request(
    _db,
    request_id: str,
    accept_data: schemas.BloodRequestAccept,
) -> Optional[schemas.BloodRequestResponse]:
    ref = db.collection(REQUESTS_COL).document(request_id)
    doc = ref.get()
    if not doc.exists:
        return None
    now = time.time()
    update = {
        "status": "en-route",
        "donor_name": accept_data.donor_name,
        "donor_eta": accept_data.donor_eta,
        "accepted_by_donor_id": accept_data.donor_id,
        "accepted_at": now,
        "lock_expires_at": now + 90 * 60,
    }
    ref.update(update)
    data = {**doc.to_dict(), **update}
    return _doc_to_request_response(request_id, data)


def cancel_blood_request(_db, request_id: str) -> Optional[schemas.BloodRequestResponse]:
    ref = db.collection(REQUESTS_COL).document(request_id)
    doc = ref.get()
    if not doc.exists:
        return None
    update = {
        "status": "awaiting",
        "donor_name": None,
        "donor_eta": None,
        "accepted_by_donor_id": None,
        "accepted_at": None,
        "lock_expires_at": None,
    }
    ref.update(update)
    data = {**doc.to_dict(), **update}
    return _doc_to_request_response(request_id, data)


def fulfill_blood_request(_db, request_id: str) -> Optional[schemas.BloodRequestResponse]:
    ref = db.collection(REQUESTS_COL).document(request_id)
    doc = ref.get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    ref.update({"status": "fulfilled"})

    # Increment donor stats
    donor_id = data.get("accepted_by_donor_id")
    if donor_id:
        donor_ref = db.collection(DONORS_COL).document(donor_id)
        donor_doc = donor_ref.get()
        if donor_doc.exists:
            donor_ref.update({
                "total_donations": (donor_doc.to_dict().get("total_donations", 0) + 1),
                "last_donation": time.strftime("%Y-%m-%d"),
            })

    data["status"] = "fulfilled"
    return _doc_to_request_response(request_id, data)


# ══════════════════════════════════════════════════════════════════════════════
# METRICS OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def get_global_metrics(_db=None) -> schemas.MetricsResponse:
    # Count fulfilled requests
    fulfilled = len(list(
        db.collection(REQUESTS_COL).where("status", "==", "fulfilled").stream()
    ))
    # Count donors
    donors_count = len(list(db.collection(DONORS_COL).stream()))

    return schemas.MetricsResponse(
        total_fulfilled=840 + fulfilled,
        total_donors=2420 + donors_count,
        avg_response_minutes=34,
        city_data=[],
        blood_data=[],
        monthly_data=[],
        top_districts=[],
    )


# ══════════════════════════════════════════════════════════════════════════════
# Thin proxy objects so routers can still do `db_req.status` etc.
# ══════════════════════════════════════════════════════════════════════════════

class _DonorProxy:
    """Thin wrapper giving attribute access to a Firestore donor dict."""
    def __init__(self, uid: str, data: dict):
        self._uid = uid
        self._data = data

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return self._data.get(name)


class _RequestProxy:
    """Thin wrapper giving attribute access to a Firestore request dict."""
    def __init__(self, id: str, data: dict):
        self.id = id
        self._data = data

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return self._data.get(name)
