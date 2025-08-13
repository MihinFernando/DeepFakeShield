# firebase_admin_init.py
import os
import firebase_admin
from firebase_admin import credentials, firestore

SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not SERVICE_ACCOUNT_PATH:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, "firebase", "serviceAccountKey.json")

print("🔎 Firebase key path:", SERVICE_ACCOUNT_PATH)
print("🔎 Key exists?", os.path.exists(SERVICE_ACCOUNT_PATH))

if not firebase_admin._apps:
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        raise RuntimeError("Service account JSON not found at " + SERVICE_ACCOUNT_PATH)
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin initialized")

db = firestore.client()
