# firebase_admin_init.py
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage # <-- ADD STORAGE
import json

SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not SERVICE_ACCOUNT_PATH:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, "firebase", "serviceAccountKey.json")

print("🔎 Firebase key path:", SERVICE_ACCOUNT_PATH)
print("🔎 Key exists?", os.path.exists(SERVICE_ACCOUNT_PATH))

# We need the project ID (or bucket name) to initialize storage
PROJECT_ID = None
if os.path.exists(SERVICE_ACCOUNT_PATH):
    try:
        with open(SERVICE_ACCOUNT_PATH, 'r') as f:
            service_account_data = json.load(f)
            PROJECT_ID = service_account_data.get('project_id')
    except Exception as e:
        print(f"⚠️ Could not read project_id from service account file: {e}")

if not firebase_admin._apps:
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        # NOTE: In a production environment, use environment variables for credentials
        raise RuntimeError("Service account JSON not found at " + SERVICE_ACCOUNT_PATH)
    
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    
    if PROJECT_ID:
        # The storage bucket is usually formatted as: {PROJECT_ID}.appspot.com
        BUCKET_NAME = f"{PROJECT_ID}.appspot.com" 
        firebase_admin.initialize_app(cred, {
            'storageBucket': BUCKET_NAME
        })
        print(f"✅ Firebase Admin initialized with Storage Bucket: {BUCKET_NAME}")
    else:
        # Fallback initialization if project_id couldn't be found
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin initialized (Storage bucket unknown - requires manual config or correct service file)")

# Global Firestore client instance
db = firestore.client()
