"""
Firebase Admin SDK initializer.
Exports `db` (Firestore client) and `firestore` module for server timestamps etc.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Path to service account key (relative to this file's directory)
_SA_KEY_PATH = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")

def _initialize() -> firebase_admin.App:
    """Initialize the Firebase Admin app (idempotent)."""
    if firebase_admin._apps:
        return firebase_admin.get_app()

    if os.path.isfile(_SA_KEY_PATH):
        cred = credentials.Certificate(os.path.abspath(_SA_KEY_PATH))
        print("[Firebase Admin] Initializing with serviceAccountKey.json")
    else:
        # Render / GCP production: use Application Default Credentials
        cred = credentials.ApplicationDefault()
        print("[Firebase Admin] Initializing with Application Default Credentials")

    return firebase_admin.initialize_app(cred, {
        "projectId": "erythronet-emergency-blood-net",
    })

_app = _initialize()
db = firestore.client()
print("[Firebase Admin] Firestore client ready ✓")
