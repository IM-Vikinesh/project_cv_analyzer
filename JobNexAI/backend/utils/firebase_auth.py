import os
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from flask import request, jsonify, current_app

firebase_initialized = False


def init_firebase():
    global firebase_initialized
    if firebase_initialized:
        return True
    
    cred_path = os.environ.get('FIREBASE_CREDENTIALS')
    
    if cred_path and os.path.exists(cred_path):
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            firebase_initialized = True
            return True
        except Exception as e:
            print(f"Firebase init error: {e}")
            return False
    
    if os.environ.get('FIREBASE_PROJECT_ID'):
        try:
            cred_dict = {
                'type': 'service_account',
                'project_id': os.environ.get('FIREBASE_PROJECT_ID'),
                'private_key_id': os.environ.get('FIREBASE_PRIVATE_KEY_ID', ''),
                'private_key': os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                'client_email': os.environ.get('FIREBASE_CLIENT_EMAIL'),
                'client_id': os.environ.get('FIREBASE_CLIENT_ID', ''),
                'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token',
            }
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            firebase_initialized = True
            return True
        except Exception as e:
            print(f"Firebase init from env error: {e}")
            return False
    
    return False


def verify_firebase_token(id_token):
    if not firebase_initialized:
        init_firebase()
    
    if not firebase_initialized:
        return None, "Firebase not configured"
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token, None
    except Exception as e:
        return None, str(e)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        id_token = parts[1]
        
        decoded_token, error = verify_firebase_token(id_token)
        
        if error:
            return jsonify({'error': f'Invalid token: {error}'}), 401
        
        request.firebase_user = decoded_token
        request.firebase_uid = decoded_token.get('uid')
        
        return f(*args, **kwargs)
    
    return decorated


def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'No authorization header'}), 401
            
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return jsonify({'error': 'Invalid authorization header'}), 401
            
            id_token = parts[1]
            decoded_token, error = verify_firebase_token(id_token)
            
            if error:
                return jsonify({'error': f'Invalid token: {error}'}), 401
            
            request.firebase_user = decoded_token
            request.firebase_uid = decoded_token.get('uid')
            request.user_role = decoded_token.get('role', 'job_seeker')
            
            if request.user_role != role:
                return jsonify({'error': f'Access denied. Required role: {role}'}), 403
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator


def optional_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        request.firebase_user = None
        request.firebase_uid = None
        
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                id_token = parts[1]
                decoded_token, error = verify_firebase_token(id_token)
                if not error:
                    request.firebase_user = decoded_token
                    request.firebase_uid = decoded_token.get('uid')
        
        return f(*args, **kwargs)
    
    return decorated
