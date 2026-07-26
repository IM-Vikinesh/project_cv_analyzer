import os
import json
from datetime import datetime
from utils.firebase_config import (
    init_firebase, get_db, get_storage_bucket
)


def get_users_collection():
    return get_db().collection('users')


def get_jobs_collection():
    return get_db().collection('jobs')


def get_applications_collection():
    return get_db().collection('applications')


def get_ai_analysis_collection():
    return get_db().collection('ai_analysis')


def get_blogs_collection():
    return get_db().collection('blogs')


def _serialize_timestamp(value):
    if not value:
        return None
    if hasattr(value, 'isoformat'):
        return value.isoformat()
    return str(value)


def user_to_dict(doc):
    if not doc:
        return None
    data = doc.to_dict()
    if not data:
        return None
    data['id'] = doc.id
    data['created_at'] = _serialize_timestamp(data.get('created_at'))
    data['updated_at'] = _serialize_timestamp(data.get('updated_at'))
    return data


def job_to_dict(doc):
    if not doc:
        return None
    data = doc.to_dict()
    if not data:
        return None
    data['id'] = doc.id
    data['created_at'] = _serialize_timestamp(data.get('created_at'))
    data['updated_at'] = _serialize_timestamp(data.get('updated_at'))
    return data


def application_to_dict(doc):
    if not doc:
        return None
    data = doc.to_dict()
    if not data:
        return None
    data['id'] = doc.id
    data['applied_at'] = _serialize_timestamp(data.get('applied_at'))
    data['updated_at'] = _serialize_timestamp(data.get('updated_at'))
    return data


def blog_to_dict(doc):
    if not doc:
        return None
    data = doc.to_dict()
    if not data:
        return None
    data['id'] = doc.id
    data['created_at'] = _serialize_timestamp(data.get('created_at'))
    data['updated_at'] = _serialize_timestamp(data.get('updated_at'))
    return data


def create_user(user_data):
    user_data['created_at'] = datetime.now()
    user_data['updated_at'] = datetime.now()
    doc_ref = get_users_collection().document()
    doc_ref.set(user_data)
    return doc_ref.id


def get_user_by_id(user_id):
    if not user_id:
        return None
    try:
        doc = get_users_collection().document(user_id).get()
        return user_to_dict(doc)
    except Exception:
        return None


def get_user_by_email(email):
    try:
        docs = get_users_collection().where('email', '==', email).limit(1).stream()
        for doc in docs:
            return user_to_dict(doc)
    except Exception as e:
        print("Firebase get_user_by_email error:", e)
    return None


def update_user(user_id, data):
    data['updated_at'] = datetime.now()
    doc_ref = get_users_collection().document(user_id)
    doc_ref.update(data)
    return get_user_by_id(user_id)


def delete_user(user_id):
    get_users_collection().document(user_id).delete()


def create_job(job_data):
    job_data['created_at'] = datetime.now()
    job_data['updated_at'] = datetime.now()
    doc_ref = get_jobs_collection().document()
    doc_ref.set(job_data)
    return doc_ref.id


def get_job_by_id(job_id):
    if not job_id:
        return None
    try:
        doc = get_jobs_collection().document(job_id).get()
        return job_to_dict(doc)
    except Exception:
        return None


def get_jobs(filters=None, limit=100, offset=0):
    query = get_jobs_collection()
    if filters:
        for key, value in filters.items():
            if value:
                query = query.where(key, '==', value)
    docs = query.stream()
    jobs = []
    for doc in docs:
        jobs.append(job_to_dict(doc))
    return jobs[offset:offset + limit]


def update_job(job_id, data):
    data['updated_at'] = datetime.now()
    doc_ref = get_jobs_collection().document(job_id)
    doc_ref.update(data)
    return get_job_by_id(job_id)


def delete_job(job_id):
    get_jobs_collection().document(job_id).delete()


def create_application(app_data):
    app_data['applied_at'] = datetime.now()
    app_data['updated_at'] = datetime.now()
    doc_ref = get_applications_collection().document()
    doc_ref.set(app_data)
    return doc_ref.id


def get_application_by_id(app_id):
    doc = get_applications_collection().document(app_id).get()
    return application_to_dict(doc)


def get_applications_by_job(job_id):
    docs = get_applications_collection().where('job_id', '==', job_id).stream()
    return [application_to_dict(doc) for doc in docs]


def get_applications_by_user(user_id):
    docs = get_applications_collection().where('applicant_id', '==', user_id).stream()
    return [application_to_dict(doc) for doc in docs]


def update_application(app_id, data):
    data['updated_at'] = datetime.now()
    doc_ref = get_applications_collection().document(app_id)
    doc_ref.update(data)
    return get_application_by_id(app_id)


def delete_application(app_id):
    get_applications_collection().document(app_id).delete()


def create_blog(blog_data):
    blog_data['created_at'] = datetime.now()
    blog_data['updated_at'] = datetime.now()
    doc_ref = get_blogs_collection().document()
    doc_ref.set(blog_data)
    return doc_ref.id


def get_blog_by_id(blog_id):
    doc = get_blogs_collection().document(blog_id).get()
    return blog_to_dict(doc)


def get_blogs(limit=100, offset=0):
    docs = get_blogs_collection().stream()
    blogs = []
    for doc in docs:
        blogs.append(blog_to_dict(doc))
    return blogs[offset:offset + limit]


def update_blog(blog_id, data):
    data['updated_at'] = datetime.now()
    doc_ref = get_blogs_collection().document(blog_id)
    doc_ref.update(data)
    return get_blog_by_id(blog_id)


def delete_blog(blog_id):
    get_blogs_collection().document(blog_id).delete()


def get_saved_jobs_collection(user_id):
    return get_users_collection().document(user_id).collection('saved_jobs')


def toggle_saved_job(user_id, job_id):
    doc_ref = get_saved_jobs_collection(user_id).document(job_id)
    doc = doc_ref.get()
    if doc.exists:
        doc_ref.delete()
        return {'saved': False}
    else:
        doc_ref.set({
            'job_id': job_id,
            'saved_at': datetime.now()
        })
        return {'saved': True}


def get_saved_job_ids(user_id):
    docs = get_saved_jobs_collection(user_id).stream()
    return [doc.id for doc in docs]


def is_job_saved(user_id, job_id):
    doc = get_saved_jobs_collection(user_id).document(job_id).get()
    return doc.exists


def get_daily_usage(user_id, usage_type='general'):
    from datetime import date
    today = date.today().isoformat()
    doc_ref = get_db().collection('daily_usage').document(f"{user_id}_{usage_type}_{today}")
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict().get('count', 0)
    return 0


def increment_daily_usage(user_id, usage_type='general'):
    from datetime import date
    from google.cloud.firestore_v1 import Increment
    today = date.today().isoformat()
    doc_ref = get_db().collection('daily_usage').document(f"{user_id}_{usage_type}_{today}")
    doc = doc_ref.get()
    if doc.exists:
        doc_ref.update({'count': Increment(1)})
    else:
        doc_ref.set({
            'user_id': user_id,
            'date': today,
            'count': 1,
            'type': usage_type
        })
