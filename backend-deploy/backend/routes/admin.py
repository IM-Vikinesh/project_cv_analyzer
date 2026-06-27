import os
import json
from flask import Blueprint, request, jsonify
from utils.firebase_config import init_firebase
from utils.firestore_db import (
    get_user_by_id, update_user, delete_user,
    create_job, get_job_by_id, update_job, delete_job,
    get_jobs, create_application, get_applications_by_job, get_applications_by_user,
    update_application, get_application_by_id,
    create_blog, get_blog_by_id, update_blog, delete_blog,
    get_blogs, get_users_collection, get_jobs_collection, get_applications_collection, get_blogs_collection,
    blog_to_dict
)

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    try:
        init_firebase()
        
        users_count = len(list(get_users_collection().stream()))
        jobs_count = len(list(get_jobs_collection().stream()))
        applications_count = len(list(get_applications_collection().stream()))
        
        return jsonify({
            'success': True,
            'stats': {
                'users': users_count,
                'jobs': jobs_count,
                'applications': applications_count
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    try:
        init_firebase()
        
        users = []
        for doc in get_users_collection().stream():
            user = doc.to_dict()
            user['id'] = doc.id
            users.append(user)
        
        users.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({'success': True, 'users': users}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['PUT'])
def update_user_admin(user_id):
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


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
def delete_user_admin(user_id):
    try:
        init_firebase()
        
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('role') == 'admin':
            return jsonify({'error': 'Cannot delete admin'}), 403
        
        delete_user(user_id)
        
        return jsonify({'success': True, 'message': 'User deleted'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/jobs', methods=['GET'])
def get_all_jobs():
    try:
        init_firebase()
        
        jobs = get_jobs(limit=1000)
        
        return jsonify({'success': True, 'jobs': jobs}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/jobs', methods=['POST'])
def create_new_job():
    try:
        init_firebase()
        data = request.get_json()
        
        if not data.get('title') or not data.get('company_name'):
            return jsonify({'error': 'title and company_name are required'}), 400
        
        job_data = {
            'recruiter_id': data.get('recruiter_id', '1'),
            'title': data['title'],
            'company_name': data.get('company_name'),
            'company_logo_url': data.get('company_logo_url'),
            'description': data.get('description'),
            'requirements': data.get('requirements'),
            'skills_required': data.get('skills_required', ''),
            'location': data.get('location'),
            'job_type': data.get('job_type', 'full-time'),
            'salary_min': data.get('salary_min'),
            'salary_max': data.get('salary_max'),
            'experience_level': data.get('experience_level', 'entry'),
            'status': data.get('status', 'active')
        }
        
        job_id = create_job(job_data)
        
        return jsonify({'success': True, 'job': {'id': job_id}}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/jobs/<job_id>', methods=['PUT'])
def update_job_admin(job_id):
    try:
        init_firebase()
        data = request.get_json()
        
        job = get_job_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        updated_job = update_job(job_id, data)
        
        return jsonify({'success': True, 'job': updated_job}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/jobs/<job_id>', methods=['DELETE'])
def delete_job_admin(job_id):
    try:
        init_firebase()
        
        job = get_job_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        delete_job(job_id)
        
        return jsonify({'success': True, 'message': 'Job deleted'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/applications', methods=['GET'])
def get_all_applications():
    try:
        init_firebase()
        
        applications = []
        for doc in get_applications_collection().stream():
            app = doc.to_dict()
            app['id'] = doc.id
            applications.append(app)
        
        applications.sort(key=lambda x: x.get('applied_at', ''), reverse=True)
        
        return jsonify({'success': True, 'applications': applications}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/applications/<app_id>', methods=['PUT'])
def update_application_status(app_id):
    try:
        init_firebase()
        data = request.get_json()
        
        application = get_application_by_id(app_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        updated_application = update_application(app_id, data)
        
        return jsonify({'success': True, 'application': updated_application}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/blogs', methods=['GET'])
def get_all_blogs():
    try:
        init_firebase()
        
        blogs = []
        for doc in get_blogs_collection().stream():
            blog = blog_to_dict(doc)
            blogs.append(blog)

        blogs.sort(key=lambda x: x.get('created_at', '') or '', reverse=True)
        
        return jsonify({'success': True, 'blogs': blogs}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/blogs', methods=['POST'])
def create_new_blog():
    try:
        init_firebase()
        data = request.get_json()
        
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'title and content are required'}), 400
        
        blog_data = {
            'author_id': data.get('author_id'),
            'title': data['title'],
            'content': data['content'],
            'image_url': data.get('image_url'),
            'status': data.get('status', 'draft')
        }
        
        blog_id = create_blog(blog_data)
        
        return jsonify({'success': True, 'blog': {'id': blog_id}}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/blogs/<blog_id>', methods=['PUT'])
def update_blog_admin(blog_id):
    try:
        init_firebase()
        data = request.get_json()
        
        blog = get_blog_by_id(blog_id)
        if not blog:
            return jsonify({'error': 'Blog not found'}), 404
        
        updated_blog = update_blog(blog_id, data)
        
        return jsonify({'success': True, 'blog': updated_blog}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/blogs/<blog_id>', methods=['DELETE'])
def delete_blog_admin(blog_id):
    try:
        init_firebase()
        
        blog = get_blog_by_id(blog_id)
        if not blog:
            return jsonify({'error': 'Blog not found'}), 404
        
        delete_blog(blog_id)
        
        return jsonify({'success': True, 'message': 'Blog deleted'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/upload', methods=['POST'])
def upload_file():
    try:
        from utils.file_storage import upload_file
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        file_url = upload_file(file)
        
        return jsonify({'success': True, 'file_url': file_url}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
