import firebase_admin
from firebase_admin import auth

def verify_firebase_id_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return uid
    except Exception as e:
        print(f"Invalid token: {e}")
        return None
