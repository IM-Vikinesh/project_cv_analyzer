import os
from flask import Blueprint, request, jsonify
from utils.firebase_config import init_firebase
from utils.firestore_db import (
    create_job, get_job_by_id, get_jobs, update_job, delete_job
)

jobs_bp = Blueprint('jobs', __name__)


@jobs_bp.route('', methods=['GET'])
def get_all_jobs():
    try:
        init_firebase()
        
        job_type = request.args.get('job_type')
        experience_level = request.args.get('experience_level')
        location = request.args.get('location')
        
        filters = {}
        if job_type:
            filters['job_type'] = job_type
        if experience_level:
            filters['experience_level'] = experience_level
        if location:
            filters['location'] = location
        
        filters['status'] = 'active'
        
        jobs = get_jobs(filters=filters, limit=100)
        
        return jsonify({'success': True, 'jobs': jobs}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@jobs_bp.route('/recruiter/jobs', methods=['GET'])
def get_recruiter_jobs():
    try:
        init_firebase()
        
        recruiter_id = request.headers.get('X-User-Id')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        filters = {}
        if recruiter_id:
            filters['recruiter_id'] = recruiter_id
        
        all_jobs = get_jobs(filters=filters, limit=1000)
        
        start = (page - 1) * per_page
        end = start + per_page
        paginated_jobs = all_jobs[start:end]
        
        return jsonify({
            'success': True,
            'jobs': paginated_jobs,
            'total': len(all_jobs),
            'pages': (len(all_jobs) + per_page - 1) // per_page if len(all_jobs) > 0 else 1,
            'current_page': page
        }), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@jobs_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    try:
        init_firebase()
        job = get_job_by_id(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        return jsonify({'success': True, 'job': job}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@jobs_bp.route('', methods=['POST'])
def create_new_job():
    try:
        init_firebase()
        data = request.get_json()
        
        recruiter_id = request.headers.get('X-User-Id') or data.get('recruiter_id')
        company_name = data.get('company_name') or data.get('company')
        
        if not data.get('title') or not company_name:
            return jsonify({'error': 'title and company are required'}), 400
        
        job_data = {
            'recruiter_id': recruiter_id,
            'title': data['title'],
            'company_name': company_name,
            'company_logo_url': data.get('company_logo_url'),
            'description': data.get('description'),
            'requirements': data.get('requirements'),
            'skills_required': data.get('skills_required', ''),
            'location': data.get('location'),
            'job_type': data.get('job_type', 'full-time'),
            'salary_min': data.get('salary_min'),
            'salary_max': data.get('salary_max'),
            'salary_currency': data.get('salary_currency'),
            'experience_level': data.get('experience_level', 'entry'),
            'status': data.get('status', 'active'),
            'application_deadline': data.get('application_deadline'),
            'department': data.get('department', ''),
            'benefits': data.get('benefits', ''),
        }
        
        job_id = create_job(job_data)
        
        return jsonify({'success': True, 'job': {'id': job_id}}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@jobs_bp.route('/<job_id>', methods=['PUT'])
def update_existing_job(job_id):
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


@jobs_bp.route('/<job_id>', methods=['DELETE'])
def delete_existing_job(job_id):
    try:
        init_firebase()
        job = get_job_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        delete_job(job_id)
        
        return jsonify({'success': True, 'message': 'Job deleted'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
