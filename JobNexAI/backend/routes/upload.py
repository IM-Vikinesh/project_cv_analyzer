from flask import Blueprint, request, jsonify
from utils.file_storage import upload_file as fs_upload_file, allowed_file
from utils.firebase_config import init_firebase

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/resume', methods=['POST'])
def upload_resume():
    try:
        init_firebase()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        user_id = request.form.get('user_id')
        
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF and DOCX files are allowed'}), 400
        
        folder = f'resumes/{user_id}' if user_id else 'resumes'
        file_url = fs_upload_file(file, subfolder=folder)
        
        return jsonify({
            'success': True,
            'file_url': file_url,
            'message': 'Resume uploaded successfully'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/profile', methods=['POST'])
def upload_profile_image():
    try:
        init_firebase()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        user_id = request.form.get('user_id')
        
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if ext not in {'png', 'jpg', 'jpeg', 'gif', 'webp'}:
            return jsonify({'error': 'Only image files are allowed'}), 400
        
        folder = f'profiles/{user_id}' if user_id else 'profiles'
        file_url = fs_upload_file(file, subfolder=folder)
        
        return jsonify({
            'success': True,
            'file_url': file_url,
            'message': 'Profile image uploaded successfully'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/application-resume', methods=['POST'])
def upload_application_resume():
    try:
        init_firebase()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        job_id = request.form.get('job_id')
        user_id = request.form.get('user_id')
        
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF and DOCX files are allowed'}), 400
        
        folder = f'applications/{user_id}'
        if job_id:
            folder = f'applications/{user_id}/job_{job_id}'
        
        file_url = fs_upload_file(file, subfolder=folder)
        
        return jsonify({
            'success': True,
            'file_url': file_url,
            'message': 'Application resume uploaded successfully'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500