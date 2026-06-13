from flask import Blueprint, request, jsonify
from utils.firebase_config import init_firebase
from utils.firestore_db import (
    create_application, get_application_by_id, 
    get_applications_by_job, get_applications_by_user,
    update_application, delete_application,
    get_jobs, get_user_by_id
)

applications_bp = Blueprint('applications', __name__)


@applications_bp.route('', methods=['POST'])
def create_app():
    try:
        init_firebase()
        data = request.get_json()
        
        applicant_id = data.get('applicant_id') or request.headers.get('X-User-Id')
        job_id = data.get('job_id')
        
        print(f"Creating application: applicant_id={applicant_id}, job_id={job_id}")
        
        if not applicant_id or not job_id:
            return jsonify({'error': 'applicant_id and job_id are required'}), 400
        
        app_data = {
            'applicant_id': applicant_id,
            'job_id': job_id,
            'resume_url': data.get('resume_url'),
            'cover_letter': data.get('cover_letter'),
            'status': 'pending',
            'notes': data.get('notes'),
            'ats_score': data.get('ats_score')
        }
        
        app_id = create_application(app_data)
        
        print(f"Application created with id: {app_id}")
        
        return jsonify({'success': True, 'application': {'id': app_id}}), 201
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/my', methods=['GET'])
def get_my_applications():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')
        
        print(f"Fetching my applications for user_id: {user_id}")
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        applications = get_applications_by_user(user_id)
        
        # Enrich with job info
        for app in applications:
            job_id = app.get('job_id')
            if job_id:
                from utils.firestore_db import get_job_by_id
                job = get_job_by_id(job_id)
                if job:
                    app['job'] = {
                        'id': job.get('id'),
                        'title': job.get('title'),
                        'company_name': job.get('company_name'),
                        'location': job.get('location'),
                        'job_type': job.get('job_type'),
                    }
        
        print(f"Found {len(applications)} applications for user {user_id}")
        
        return jsonify({'success': True, 'applications': applications}), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/user/<applicant_id>', methods=['GET'])
def get_user_applications(applicant_id):
    try:
        init_firebase()
        applications = get_applications_by_user(applicant_id)
        
        return jsonify({'success': True, 'applications': applications}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/job/<job_id>', methods=['GET'])
def get_job_applications(job_id):
    try:
        init_firebase()
        
        applications = get_applications_by_job(job_id)
        
        # Enrich with applicant info
        for app in applications:
            applicant_id = app.get('applicant_id')
            if applicant_id:
                applicant = get_user_by_id(applicant_id)
                if applicant:
                    app['applicant'] = {
                        'name': applicant.get('full_name'),
                        'email': applicant.get('email'),
                        'phone': applicant.get('phone'),
                        'skills': applicant.get('skills'),
                        'bio': applicant.get('bio'),
                        'location': applicant.get('location'),
                    }
        
        return jsonify({'success': True, 'applications': applications}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/recruiter/all', methods=['GET'])
def get_recruiter_all_applications():
    try:
        init_firebase()
        recruiter_id = request.headers.get('X-User-Id')
        
        print(f"Recruiter all apps - recruiter_id: {recruiter_id}")
        
        if not recruiter_id:
            return jsonify({'error': 'User ID required'}), 400
        
        jobs = get_jobs(filters={'recruiter_id': recruiter_id}, limit=1000)
        print(f"Recruiter {recruiter_id} has {len(jobs)} jobs in Firestore")
        
        applications = []
        for job in jobs:
            print(f"  Job {job['id']}: {job.get('title')}")
            job_apps = get_applications_by_job(job['id'])
            print(f"    Found {len(job_apps)} applications for this job")
            for app in job_apps:
                app['job'] = job
                # Enrich with applicant info
                if app.get('applicant_id'):
                    applicant = get_user_by_id(app['applicant_id'])
                    if applicant:
                        app['applicant'] = {
                            'name': applicant.get('full_name'),
                            'email': applicant.get('email'),
                            'phone': applicant.get('phone'),
                            'skills': applicant.get('skills'),
                            'bio': applicant.get('bio'),
                            'location': applicant.get('location'),
                        }
                applications.append(app)
        
        print(f"Total applications for recruiter: {len(applications)}")
        
        return jsonify({'success': True, 'applications': applications}), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/<app_id>', methods=['PUT'])
def update_app(app_id):
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


@applications_bp.route('/<app_id>/status', methods=['PUT'])
def update_app_status(app_id):
    try:
        init_firebase()
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'status is required'}), 400
        
        updated = update_application(app_id, {'status': data['status']})
        
        return jsonify({'success': True, 'application': updated}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/<app_id>', methods=['DELETE'])
def delete_app(app_id):
    try:
        init_firebase()
        application = get_application_by_id(app_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        delete_application(app_id)
        
        return jsonify({'success': True, 'message': 'Application deleted'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
