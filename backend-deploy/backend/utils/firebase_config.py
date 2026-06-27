import os
import json
from datetime import datetime

firebase_initialized = False
db = None
bucket = None


def init_firebase():
    global firebase_initialized, db, bucket

    if firebase_initialized:
        return db, bucket

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, storage

        service_account_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')

        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            with open(service_account_path, 'r') as f:
                service_account = json.load(f)
            project_id = service_account.get('project_id')
        else:
            project_id = os.environ.get('FIREBASE_PROJECT_ID')
            private_key = os.environ.get('FIREBASE_PRIVATE_KEY')
            client_email = os.environ.get('FIREBASE_CLIENT_EMAIL')

            if not (project_id and private_key and 'BEGIN PRIVATE KEY' in private_key):
                raise Exception("Firebase credentials not configured.")

            private_key = private_key.replace('\\n', '\n')

            service_account = {
                "type": "service_account",
                "project_id": project_id,
                "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
                "private_key": private_key,
                "client_email": client_email,
                "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email}"
            }
            cred = credentials.Certificate(service_account)

        app = firebase_admin.initialize_app(cred, {
            'storageBucket': f'{project_id}.firebasestorage.app'
        })

        db = firestore.client()
        bucket = storage.bucket(app=app)

        firebase_initialized = True
        print(f"Firebase initialized successfully for project: {project_id}")

        return db, bucket

    except Exception as e:
        raise Exception(f"Firebase initialization error: {e}")


def get_db():
    global db
    if not db:
        init_firebase()
    return db


def get_storage_bucket():
    global bucket
    if not bucket:
        init_firebase()
    return bucket
