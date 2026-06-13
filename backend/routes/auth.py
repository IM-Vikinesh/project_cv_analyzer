import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from utils.firebase_config import init_firebase, get_db
from utils.firestore_db import (
    create_user, get_user_by_id, get_user_by_email, update_user, delete_user
)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        init_firebase()
        data = request.get_json()
        
        name = data.get('full_name') or data.get('name')
        email = data.get('email')
        
        if not email or not name:
            return jsonify({'error': 'name and email are required'}), 400
        
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({'error': 'Email already exists'}), 400
        
        role = data.get('role', 'job_seeker')
        password = data.get('password', '')
        password_hash = generate_password_hash(password) if password else ''
        
        user_data = {
            'full_name': name,
            'email': email,
            'password': password_hash,
            'role': role,
            'phone': data.get('phone'),
            'location': data.get('location'),
            'bio': data.get('bio'),
            'skills': data.get('skills'),
            'experience': data.get('experience'),
            'education': data.get('education'),
            'company_name': data.get('company_name'),
            'position': data.get('position'),
            'company_website': data.get('company_website'),
            'linkedin_url': data.get('linkedin_url'),
            'twitter_url': data.get('twitter_url'),
            'facebook_url': data.get('facebook_url')
        }
        
        user_id = create_user(user_data)
        
        return jsonify({
            'success': True,
            'user': {'id': user_id, 'full_name': name, 'email': email, 'role': role}
        }), 201
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        init_firebase()
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if user.get('password') and not check_password_hash(user['password'], password or ''):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'full_name': user['full_name'],
                'email': user['email'],
                'role': user['role'],
                'company_name': user.get('company_name'),
                'position': user.get('position'),
                'company_website': user.get('company_website'),
                'linkedin_url': user.get('linkedin_url'),
                'twitter_url': user.get('twitter_url'),
                'facebook_url': user.get('facebook_url'),
                'phone': user.get('phone'),
                'location': user.get('location'),
                'bio': user.get('bio'),
                'profile_image_url': user.get('profile_image_url'),
                'skills': user.get('skills'),
                'experience': user.get('experience'),
                'education': user.get('education'),
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    try:
        init_firebase()
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'success': True, 'user': user}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/profile/<user_id>', methods=['PUT'])
def update_profile(user_id):
    try:
        init_firebase()
        data = request.get_json()
        
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        updated_user = update_user(user_id, data)
        
        return jsonify({'success': True, 'user': updated_user}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/profile/<user_id>', methods=['DELETE'])
def delete_profile(user_id):
    try:
        init_firebase()
        delete_user(user_id)
        return jsonify({'success': True, 'message': 'User deleted'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500