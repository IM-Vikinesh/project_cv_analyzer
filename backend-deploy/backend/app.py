import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request as flask_request
from flask_cors import CORS
from routes.auth import auth_bp
from routes.jobs import jobs_bp
from routes.applications import applications_bp
from routes.ai import ai_bp
from routes.upload import upload_bp
from routes.admin import admin_bp
from routes.blog import blog_bp
from routes.chatbot import chatbot_bp
from utils.firebase_config import init_firebase

def create_app():
    app = Flask(__name__)
    
    allowed_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://job-nex-ai.vercel.app').split(',')
    CORS(app, origins=allowed_origins, allow_headers=["Content-Type", "X-User-Id"], supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(blog_bp, url_prefix='/api/blogs')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    
    db, bucket = init_firebase()
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'JobNex AI Backend',
            'version': '3.0.0',
            'database': 'Firebase Firestore',
            'storage': 'Firebase Storage'
        }), 200
    
    
    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"Starting JobNex AI Backend on port {port}...")
    print(f"Database: Firebase Firestore")
    
    @app.errorhandler(Exception)
    def handle_error(e):
        import traceback
        print("Unhandled error:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500
    
    app.run(host='0.0.0.0', port=port, debug=debug)