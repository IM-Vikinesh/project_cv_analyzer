import os
import json
from flask import Blueprint, request, jsonify
from utils.firebase_config import init_firebase
from utils.firestore_db import (
    get_blogs_collection, get_blog_by_id as get_blog_doc, blog_to_dict
)

blog_bp = Blueprint('blog', __name__)


@blog_bp.route('', methods=['GET'])
@blog_bp.route('/', methods=['GET'])
def get_published_blogs():
    try:
        init_firebase()
        
        limit = request.args.get('limit', 6, type=int)
        
        blogs = []
        query = get_blogs_collection().where('status', '==', 'published').limit(limit)
        for doc in query.stream():
            blog = blog_to_dict(doc)
            blogs.append(blog)

        blogs.sort(key=lambda x: x.get('created_at', '') or '', reverse=True)
        
        return jsonify({'success': True, 'blogs': blogs}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@blog_bp.route('/<blog_id>', methods=['GET'])
def get_blog(blog_id):
    try:
        init_firebase()
        
        blog = get_blog_doc(blog_id)
        if not blog:
            return jsonify({'error': 'Blog not found'}), 404
        
        if blog.get('status') != 'published':
            return jsonify({'error': 'Blog not found'}), 404
        
        return jsonify({'success': True, 'blog': blog}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
