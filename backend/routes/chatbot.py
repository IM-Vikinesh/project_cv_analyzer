import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.firebase_config import init_firebase, get_db
from utils.firestore_db import get_user_by_id, get_daily_usage, increment_daily_usage
from utils.gemini_helper import assistant

chatbot_bp = Blueprint('chatbot', __name__)
DAILY_LIMIT = 10


def check_ai_limit(user_id):
    user = get_user_by_id(user_id)
    if user and user.get('role') == 'admin':
        return None
    usage = get_daily_usage(user_id)
    if usage >= DAILY_LIMIT:
        return "Your daily limit is over. Try again after 12 hours."
    return None


def get_chat_messages_collection():
    return get_db().collection('chat_messages')


def get_chat_sessions_collection():
    return get_db().collection('chat_sessions')


@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    try:
        init_firebase()
        data = request.get_json()
        user_id = request.headers.get('X-User-Id')

        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        limit_err = check_ai_limit(user_id)
        if limit_err:
            return jsonify({'error': limit_err, 'limit_exceeded': True}), 429

        message = data.get('message', '').strip()
        session_id = data.get('session_id')

        if not message:
            return jsonify({'error': 'Message is required'}), 400

        if not session_id:
            session_id = str(uuid.uuid4())

        try:
            user = get_user_by_id(user_id)
        except Exception:
            user = None
        user_context = {
            'name': user.get('full_name') or user.get('name') if user else None,
            'skills': user.get('skills') if user else None,
            'experience': user.get('experience') if user else None,
            'education': user.get('education') if user else None,
        } if user else None

        session_ref = get_chat_sessions_collection().document(session_id)
        if not session_ref.get().exists:
            session_ref.set({
                'user_id': user_id,
                'session_id': session_id,
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'message_count': 0
            })

        history_docs = get_chat_messages_collection() \
            .where('session_id', '==', session_id) \
            .stream()

        history_list = []
        for doc in history_docs:
            msg_data = doc.to_dict()
            history_list.append(msg_data)

        history_list.sort(key=lambda x: x.get('timestamp') or datetime.min)

        messages = []
        for msg_data in history_list[-20:]:
            messages.append({
                'role': msg_data['role'],
                'content': msg_data['content']
            })

        messages.append({'role': 'user', 'content': message})

        user_msg_ref = get_chat_messages_collection().document()
        user_msg_ref.set({
            'user_id': user_id,
            'session_id': session_id,
            'role': 'user',
            'content': message,
            'timestamp': datetime.now()
        })

        ai_response, error = assistant.chat(messages, user_context)

        if error:
            return jsonify({'error': error}), 500

        ai_msg_ref = get_chat_messages_collection().document()
        ai_msg_ref.set({
            'user_id': user_id,
            'session_id': session_id,
            'role': 'assistant',
            'content': ai_response,
            'timestamp': datetime.now()
        })

        session_ref.update({
            'updated_at': datetime.now(),
            'message_count': session_ref.get().to_dict().get('message_count', 0) + 2
        })

        increment_daily_usage(user_id)

        return jsonify({
            'success': True,
            'response': ai_response,
            'session_id': session_id
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@chatbot_bp.route('/history', methods=['GET'])
def get_history():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')

        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        session_id = request.args.get('session_id')
        limit = min(int(request.args.get('limit', 30)), 100)

        if not session_id:
            session_docs = get_chat_sessions_collection() \
                .where('user_id', '==', user_id) \
                .stream()

            sessions_list = []
            for s in session_docs:
                s_data = s.to_dict()
                s_data['_id'] = s.id
                sessions_list.append(s_data)

            sessions_list.sort(key=lambda x: x.get('updated_at') or datetime.min, reverse=True)
            session_id = sessions_list[0]['_id'] if sessions_list else None

            if not session_id:
                return jsonify({
                    'success': True,
                    'messages': [],
                    'session_id': None
                }), 200

        msg_docs = get_chat_messages_collection() \
            .where('session_id', '==', session_id) \
            .stream()

        msg_list = []
        for doc in msg_docs:
            msg_data = doc.to_dict()
            msg_data['_id'] = doc.id
            msg_list.append(msg_data)

        msg_list.sort(key=lambda x: x.get('timestamp') or datetime.min)

        messages = []
        for msg_data in msg_list[-limit:]:
            messages.append({
                'id': msg_data['_id'],
                'role': msg_data['role'],
                'content': msg_data['content'],
                'timestamp': msg_data['timestamp'].isoformat() if hasattr(msg_data['timestamp'], 'isoformat') else str(msg_data['timestamp']),
                'session_id': msg_data.get('session_id', session_id)
            })

        return jsonify({
            'success': True,
            'messages': messages,
            'session_id': session_id
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@chatbot_bp.route('/sessions', methods=['GET'])
def get_sessions():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')

        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        docs = get_chat_sessions_collection() \
            .where('user_id', '==', user_id) \
            .stream()

        sessions_list = []
        for doc in docs:
            data = doc.to_dict()
            data['_id'] = doc.id
            sessions_list.append(data)

        sessions_list.sort(key=lambda x: x.get('updated_at') or datetime.min, reverse=True)

        sessions = []
        for data in sessions_list[:10]:
            sessions.append({
                'session_id': data['_id'],
                'created_at': data.get('created_at').isoformat() if data.get('created_at') else None,
                'updated_at': data.get('updated_at').isoformat() if data.get('updated_at') else None,
                'message_count': data.get('message_count', 0)
            })

        return jsonify({'success': True, 'sessions': sessions}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chatbot_bp.route('/cv-analysis', methods=['POST'])
def cv_analysis():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')

        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        limit_err = check_ai_limit(user_id)
        if limit_err:
            return jsonify({'error': limit_err, 'limit_exceeded': True}), 429

        data = request.get_json()
        cv_text = data.get('cv_text', '').strip()
        specific_focus = data.get('focus', 'general')

        if not cv_text:
            return jsonify({'error': 'CV text is required'}), 400

        try:
            user = get_user_by_id(user_id)
        except Exception:
            user = None

        prompt = f"""As an expert CV reviewer and ATS optimization specialist, analyze the following CV content:

CV CONTENT:
{cv_text[:4000]}

FOCUS AREA: {specific_focus}

Please provide:
1. **Overall Assessment** - Brief overview of the CV quality
2. **ATS Compatibility Score** (out of 100) - How well this CV would perform in Applicant Tracking Systems
3. **Strengths** - What the CV does well
4. **Areas for Improvement** - Specific, actionable suggestions
5. **Missing Keywords** - Important keywords missing based on current industry standards
6. **Suggested Improvements** - Before/after examples for key bullet points
7. **Format & Structure Recommendations** - How to better organize the content

Be specific and actionable. Provide before/after rewrites for weak bullet points."""

        messages = [{'role': 'user', 'content': prompt}]

        user_context = {
            'name': user.get('full_name') or user.get('name') if user else None,
            'skills': user.get('skills') if user else None,
        } if user else None

        response, error = assistant.chat(messages, user_context)

        if error:
            return jsonify({'error': error}), 500

        increment_daily_usage(user_id)
        return jsonify({'success': True, 'analysis': response}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@chatbot_bp.route('/career-roadmap', methods=['POST'])
def career_roadmap():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')

        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        limit_err = check_ai_limit(user_id)
        if limit_err:
            return jsonify({'error': limit_err, 'limit_exceeded': True}), 429

        data = request.get_json()
        target_role = data.get('target_role', '').strip()
        current_skills = data.get('current_skills', '').strip()
        time_frame = data.get('time_frame', '6 months')

        try:
            user = get_user_by_id(user_id)
        except Exception:
            user = None
        user_skills = current_skills or (user.get('skills') if user else '')

        prompt = f"""Create a detailed career roadmap based on the following:

Current Skills: {user_skills}
Target Role: {target_role if target_role else 'Not specified - suggest based on skills'}
Time Frame: {time_frame}

Please provide a comprehensive roadmap including:

1. **Short-term Goals** (Next 3 months)
2. **Mid-term Goals** (3-6 months)
3. **Long-term Goals** (6-12+ months)
4. **Skills to Learn** organized by priority:
   - Must-learn (critical for the target role)
   - Nice-to-have (would strengthen the profile)
   - Future-proof (emerging technologies)
5. **Projects to Build** - Specific project ideas with technologies to use
6. **Certifications & Courses** - Recommended certifications with brief explanation of value
7. **Learning Resources** - Books, courses, platforms, and communities
8. **Milestones** - Key achievements to aim for
9. **Portfolio Building Suggestions**

Make the roadmap practical, specific, and tailored to the user's current skill level."""

        messages = [{'role': 'user', 'content': prompt}]

        user_context = {
            'name': user.get('full_name') or user.get('name') if user else None,
            'skills': user.get('skills') if user else None,
            'experience': user.get('experience') if user else None,
            'education': user.get('education') if user else None,
        } if user else None

        response, error = assistant.chat(messages, user_context)

        if error:
            return jsonify({'error': error}), 500

        increment_daily_usage(user_id)
        return jsonify({'success': True, 'roadmap': response}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@chatbot_bp.route('/interview-coach', methods=['POST'])
def interview_coach():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')

        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        limit_err = check_ai_limit(user_id)
        if limit_err:
            return jsonify({'error': limit_err, 'limit_exceeded': True}), 429

        data = request.get_json()
        action = data.get('action', 'generate_questions')
        job_title = data.get('job_title', '')
        experience_level = data.get('experience_level', 'mid')
        question_type = data.get('question_type', 'technical')
        user_answer = data.get('user_answer', '')

        try:
            user = get_user_by_id(user_id)
        except Exception:
            user = None
        user_skills = user.get('skills') if user else ''

        if action == 'generate_questions':
            prompt = f"""You are an experienced technical interviewer. Generate interview questions for the following role:

Job Title: {job_title if job_title else 'General Software Development'}
Experience Level: {experience_level}
Question Type: {question_type}
Candidate Skills: {user_skills}

Generate 5 questions with:
1. The question itself
2. What the interviewer is looking for
3. Key points a strong answer should include
4. Common mistakes to avoid

Format the response with clear sections for each question."""

        elif action == 'evaluate_answer':
            prompt = f"""You are an experienced technical interviewer evaluating a candidate's response.

Job Title: {job_title if job_title else 'Not specified'}
Experience Level: {experience_level}
Question Type: {question_type}

Candidate's Answer:
{user_answer}

Please provide:
1. **Overall Assessment** - How well the answer addresses the question
2. **Strengths** - What the candidate did well
3. **Areas for Improvement** - Specific suggestions
4. **Model Answer** - How a strong answer would be structured
5. **Score** (out of 100)
6. **Follow-up Questions** - What the interviewer might ask next

Be constructive and specific."""

        else:
            return jsonify({'error': 'Invalid action. Use generate_questions or evaluate_answer.'}), 400

        messages = [{'role': 'user', 'content': prompt}]

        user_context = {
            'name': user.get('full_name') or user.get('name') if user else None,
            'skills': user_skills,
        } if user else None

        response, error = assistant.chat(messages, user_context)

        if error:
            return jsonify({'error': error}), 500

        increment_daily_usage(user_id)
        return jsonify({'success': True, 'response': response}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@chatbot_bp.route('/job-recommendations', methods=['POST'])
def job_recommendations():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')

        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        limit_err = check_ai_limit(user_id)
        if limit_err:
            return jsonify({'error': limit_err, 'limit_exceeded': True}), 429

        data = request.get_json()
        user_skills_input = data.get('skills', '').strip()
        preferences = data.get('preferences', '').strip()

        try:
            user = get_user_by_id(user_id)
        except Exception:
            user = None
        skills = user_skills_input or (user.get('skills') if user else '')

        from utils.firestore_db import get_jobs
        jobs = get_jobs(filters={'status': 'active'}, limit=20)

        jobs_context = ""
        if jobs:
            for i, job in enumerate(jobs[:10]):
                jobs_context += f"""
Job {i+1}:
- Title: {job.get('title', 'N/A')}
- Company: {job.get('company', 'N/A')}
- Location: {job.get('location', 'N/A')}
- Type: {job.get('type', 'N/A')}
- Skills Required: {job.get('skills_required', 'N/A')}
- Description: {job.get('description', 'N/A')[:200]}
"""

        prompt = f"""You are a career advisor specializing in job matching.

USER'S SKILLS:
{skills}

USER PREFERENCES:
{preferences if preferences else 'Not specified'}

AVAILABLE JOB LISTINGS:
{jobs_context if jobs_context else 'No specific job listings available at this time.'}

Please provide:
1. **Top Job Matches** - Rank the most suitable jobs with match percentage
2. **Why Each Job Matches** - Specific reasons linking skills to job requirements
3. **Skill Gaps** - What skills the user needs to be more competitive
4. **Alternative Roles** - Other roles the user could consider based on their skills
5. **Career Growth Tips** - How to improve employability for these roles

If no specific job listings are available, provide general job recommendations based on the user's skills and current market demand."""

        messages = [{'role': 'user', 'content': prompt}]

        user_context = {
            'name': user.get('full_name') or user.get('name') if user else None,
            'skills': skills,
            'experience': user.get('experience') if user else None,
            'location': user.get('location') if user else None,
        } if user else None

        response, error = assistant.chat(messages, user_context)

        if error:
            return jsonify({'error': error}), 500

        increment_daily_usage(user_id)
        return jsonify({'success': True, 'recommendations': response}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
