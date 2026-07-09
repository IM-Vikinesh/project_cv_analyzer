import os
import uuid
from datetime import datetime
from urllib.parse import quote
from werkzeug.utils import secure_filename
from utils.firebase_config import get_storage_bucket

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_file_extension(filename):
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


def generate_filename(original_filename):
    ext = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4())[:12]
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"{timestamp}_{unique_id}.{ext}"


def upload_to_firebase_storage(file, folder='uploads'):
    bucket = get_storage_bucket()

    if not bucket:
        raise Exception("Firebase Storage not configured")

    filename = generate_filename(secure_filename(file.filename))
    blob_path = f"{folder}/{filename}"

    try:
        blob = bucket.blob(blob_path)
        file.seek(0)
        blob.upload_from_file(file, content_type=file.content_type)

        try:
            blob.make_public()
            return blob.public_url
        except Exception:
            blob_path_encoded = quote(blob_path, safe='')
            return f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{blob_path_encoded}?alt=media"

    except Exception as e:
        raise Exception(f"Firebase upload error: {str(e)}")


def upload_file(file, subfolder=''):
    if not file or not file.filename:
        raise ValueError("No file provided")

    if not allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)

    if size > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB")

    folder = f"uploads/{subfolder}" if subfolder else 'uploads'
    return upload_to_firebase_storage(file, folder)


def get_file_url(path):
    if not path:
        return None

    if path.startswith('http'):
        return path

    raise Exception("Local file paths are not supported in Firebase-only mode")
