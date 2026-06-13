import sys
import os
import traceback

root = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, root)
sys.path.insert(0, os.path.join(root, 'backend'))

try:
    from app import create_app
    app = create_app()
except Exception as e:
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return jsonify({
            'error': 'Backend initialization failed',
            'detail': str(e),
            'traceback': traceback.format_exc()
        }), 500
    
    @app.errorhandler(Exception)
    def handle_error(ex):
        return jsonify({
            'error': str(ex),
            'traceback': traceback.format_exc()
        }), 500
