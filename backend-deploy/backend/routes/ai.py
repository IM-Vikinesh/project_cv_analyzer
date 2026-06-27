import os
import json
import tempfile
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.firebase_config import init_firebase
from utils.firestore_db import get_ai_analysis_collection, get_user_by_id, update_user
from utils.ai_processor import analyze_resume, recommend_with_gaps
from utils.file_storage import upload_file as fs_upload_file

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/analyze-cv', methods=['POST'])
def analyze_cv():
    try:
        init_firebase()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        user_id = request.form.get('user_id')
        
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        try:
            analysis_result = analyze_resume(tmp_path)
        except Exception as e:
            print(f"Resume analysis error: {e}")
            raise Exception(f"Failed to analyze resume: {str(e)}")
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except:
                    pass
        
        doc_ref = get_ai_analysis_collection().document()
        analysis_data = {
            'user_id': user_id,
            'analysis_type': 'resume_analysis',
            'result_data': analysis_result,
            'created_at': datetime.now().isoformat(),
        }
        doc_ref.set(analysis_data)
        analysis_id = doc_ref.id
        
        analysis_result['id'] = analysis_id
        analysis_result['created_at'] = analysis_data['created_at']
        
        return jsonify({'success': True, 'analysis': analysis_result}), 201
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/analyze', methods=['POST'])
def analyze():
    try:
        init_firebase()
        data = request.get_json()
        
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        analysis_data = {
            'user_id': user_id,
            'analysis_type': data.get('analysis_type', 'resume_analysis'),
            'input_data': data.get('input_data', {}),
            'result_data': data.get('result_data', {}),
            'score': data.get('score', 0)
        }
        
        doc_ref = get_ai_analysis_collection().document()
        doc_ref.set(analysis_data)
        analysis_id = doc_ref.id
        
        analysis = doc_ref.get().to_dict()
        analysis['id'] = analysis_id
        
        return jsonify({'success': True, 'analysis': analysis}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/user/<user_id>', methods=['GET'])
def get_user_analysis(user_id):
    try:
        init_firebase()
        
        analyses = []
        docs = get_ai_analysis_collection().where('user_id', '==', user_id).stream()
        for doc in docs:
            analysis = doc.to_dict()
            analysis['id'] = doc.id
            analyses.append(analysis)
        
        analyses.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({'success': True, 'analyses': analyses}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    try:
        init_firebase()
        
        doc = get_ai_analysis_collection().document(analysis_id).get()
        
        if not doc.exists:
            return jsonify({'error': 'Analysis not found'}), 404
        
        analysis = doc.to_dict()
        analysis['id'] = doc.id
        
        return jsonify({'success': True, 'analysis': analysis}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/save-to-profile', methods=['POST'])
def save_analysis_to_profile():
    try:
        init_firebase()
        data = request.get_json()
        user_id = data.get('user_id')
        analysis_id = data.get('analysis_id')

        if not user_id or not analysis_id:
            return jsonify({'error': 'user_id and analysis_id are required'}), 400

        doc = get_ai_analysis_collection().document(analysis_id).get()
        if not doc.exists:
            return jsonify({'error': 'Analysis not found'}), 404

        result = doc.to_dict().get('result_data', {})
        if not result:
            return jsonify({'error': 'No result data in analysis'}), 400

        skills_text = ', '.join(result.get('skills', [])) if result.get('skills') else ''

        exp_entries = result.get('experience', [])
        exp_lines = []
        for exp in exp_entries:
            if isinstance(exp, dict):
                parts = []
                if exp.get('role'):
                    parts.append(f"Role: {exp['role']}")
                if exp.get('company'):
                    parts.append(f"Company: {exp['company']}")
                if exp.get('duration'):
                    parts.append(f"Duration: {exp['duration']}")
                if exp.get('description'):
                    parts.append(f"Details: {exp['description']}")
                if parts:
                    exp_lines.append(' | '.join(parts))
            elif isinstance(exp, str):
                exp_lines.append(exp)
        experience_text = '\n'.join(exp_lines) if exp_lines else ''

        edu_raw = result.get('education', {})
        if isinstance(edu_raw, dict):
            edu_entries = edu_raw.get('entries', [])
        elif isinstance(edu_raw, list):
            edu_entries = edu_raw
        else:
            edu_entries = []
        edu_lines = []
        for edu in edu_entries:
            if isinstance(edu, dict):
                parts = []
                if edu.get('institution'):
                    parts.append(f"Institution: {edu['institution']}")
                if edu.get('degree'):
                    parts.append(f"Degree: {edu['degree']}")
                if edu.get('field'):
                    parts.append(f"Field: {edu['field']}")
                if edu.get('year'):
                    parts.append(f"Year: {edu['year']}")
                if parts:
                    edu_lines.append(' | '.join(parts))
            elif isinstance(edu, str):
                edu_lines.append(edu)
        education_text = '\n'.join(edu_lines) if edu_lines else ''

        profile_update = {}
        if skills_text:
            profile_update['skills'] = skills_text
        if experience_text:
            profile_update['experience'] = experience_text
        if education_text:
            profile_update['education'] = education_text

        if not profile_update:
            return jsonify({'error': 'No savable data found in analysis'}), 400

        updated_user = update_user(user_id, profile_update)

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully with extracted resume data',
            'user': updated_user
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/recommend-from-skills', methods=['POST'])
def recommend_from_skills():
    from utils.firestore_db import get_jobs
    try:
        init_firebase()
        data = request.get_json()
        skills = data.get('skills', [])

        if not skills:
            return jsonify({'error': 'No skills provided'}), 400

        jobs = get_jobs(filters={'status': 'active'}, limit=50)
        recommendations, skill_gaps = recommend_with_gaps(skills, jobs)

        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'skill_gaps': skill_gaps,
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    try:
        init_firebase()
        user_id = request.headers.get('X-User-Id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        user = get_user_by_id(user_id)
        
        if not user or not user.get('skills'):
            return jsonify({'recommendations': [], 'user_skills': []}), 200
        
        user_skills = [s.strip() for s in user['skills'].split(',') if s.strip()]
        
        from utils.firestore_db import get_jobs
        jobs = get_jobs(filters={'status': 'active'}, limit=50)
        
        from utils.ai_processor import recommend_jobs
        recommendations = recommend_jobs(user_skills, jobs)
        
        return jsonify({
            'recommendations': recommendations,
            'user_skills': user_skills
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/generate-cover-letter', methods=['POST'])
def generate_cover_letter_route():
    try:
        init_firebase()
        data = request.get_json()
        
        job_title = data.get('job_title', '') or ''
        company = data.get('company', '') or ''
        job_description = data.get('job_description', '') or ''
        requirements = data.get('requirements', '') or ''
        skills_required = data.get('skills_required', '') or ''
        applicant_name = data.get('applicant_name', '') or ''
        applicant_skills = data.get('applicant_skills', '') or ''
        applicant_experience = data.get('applicant_experience', '') or ''
        applicant_bio = data.get('applicant_bio', '') or ''
        applicant_location = data.get('applicant_location', '') or ''
        
        if not job_title or not company:
            return jsonify({'error': 'job_title and company are required'}), 400
        
        cover_letter = None
        
        try:
            from utils.gemini_helper import assistant
            prompt = f"""Write a highly professional, compelling cover letter for the following job application:

Position: {job_title}
Company: {company}
Job Description: {job_description}
Requirements: {requirements}
Skills Required: {skills_required}

Applicant Info:
- Name: {applicant_name}
- Skills: {applicant_skills}
- Experience: {applicant_experience}
- Bio: {applicant_bio}
- Location: {applicant_location}

The cover letter MUST:
1. Be 3-4 powerful paragraphs that tell a compelling story
2. Open with a confident, attention-grabbing first sentence
3. Map the applicant's specific skills and experiences to the job requirements
4. Include concrete achievements and results where possible
5. Show deep enthusiasm for the role AND the company's mission
6. End with a confident call to action
7. Be written in a professional yet warm tone
8. NOT use generic phrases like "I am writing to apply" or placeholder text
9. Be specific to this job and company — never generic

Format as plain text ready to send as an email or letter."""

            response, error = assistant.chat([{"role": "user", "content": prompt}])
            if response:
                cover_letter = response
        except Exception:
            pass
        
        if not cover_letter:
            cover_letter = generate_template_cover_letter(
                job_title=job_title,
                company=company,
                job_description=job_description,
                requirements=requirements,
                skills_required=skills_required,
                applicant_name=applicant_name,
                applicant_skills=applicant_skills,
                applicant_experience=applicant_experience,
                applicant_bio=applicant_bio,
                applicant_location=applicant_location,
            )
        
        return jsonify({'success': True, 'cover_letter': cover_letter}), 200
    
    except Exception as e:
        import traceback
        print("Cover letter generation error:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500


def generate_template_cover_letter(job_title, company, job_description, requirements='', 
                                    skills_required='', applicant_name='', applicant_skills='', 
                                    applicant_experience='', applicant_bio='', applicant_location=''):
    
    skills_list = []
    if skills_required:
        skills_list = [s.strip() for s in skills_required.split(',') if s.strip()]
    
    applicant_skills_list = []
    if applicant_skills:
        applicant_skills_list = [s.strip() for s in applicant_skills.split(',') if s.strip()]
    
    matched_skills = []
    for skill in applicant_skills_list:
        for req_skill in skills_list:
            if skill.lower() in req_skill.lower() or req_skill.lower() in skill.lower():
                matched_skills.append(skill)
                break
    
    skills_to_highlight = matched_skills if matched_skills else applicant_skills_list[:5]
    skills_text = ', '.join(skills_to_highlight) if skills_to_highlight else 'my relevant skills'
    
    location_text = f'based in {applicant_location}' if applicant_location else ''
    
    experience_intro = ''
    if applicant_experience:
        exp_preview = applicant_experience[:200]
        experience_intro = f"\n\nThroughout my career, I have {exp_preview}"
    
    bio_intro = ''
    if applicant_bio:
        bio_preview = applicant_bio[:150]
        bio_intro = f" {bio_preview}"
    
    company_focus = ''
    if job_description:
        keywords = ['innovat', 'leadership', 'growth', 'excellence', 'quality', 'customer', 'technology', 'solution']
        for kw in keywords:
            if kw in job_description.lower():
                if kw == 'innovat':
                    company_focus = " your commitment to innovation"
                elif kw == 'leadership':
                    company_focus = " your leadership in the industry"
                elif kw == 'growth':
                    company_focus = " your impressive growth trajectory"
                elif kw == 'excellence':
                    company_focus = " your reputation for excellence"
                elif kw == 'technology':
                    company_focus = " your technological innovation"
                elif kw == 'customer':
                    company_focus = " your customer-first approach"
                elif kw == 'quality':
                    company_focus = " your dedication to quality"
                elif kw == 'solution':
                    company_focus = " your solution-driven mindset"
                break
    
    name_line = f"{applicant_name}" if applicant_name else "[Your Name]"
    location_line = f"\n{applicant_location}" if applicant_location else ""
    
    cover_letter = f"""Dear Hiring Manager at {company},

I am writing to express my strong interest in the {job_title} position at {company}.{bio_intro} With a proven track record and expertise in {skills_text}, I am confident that I would be a valuable addition to your team.

What excites me most about this opportunity at {company} is{company_focus}. The role aligns perfectly with my professional goals and skill set. My experience in {skills_text} positions me well to contribute meaningfully to your organization from day one.{experience_intro}

I am particularly drawn to this role because it offers the opportunity to leverage my skills in {skills_text} while contributing to {company}'s continued success. I thrive in environments that challenge me to grow and innovate, and I believe your team would provide exactly the kind of dynamic setting where I can deliver my best work.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm can contribute to the continued success of {company}. Thank you for considering my application. I look forward to the possibility of speaking with you.

Sincerely,
{name_line}{location_line}"""
    
    return cover_letter


@ai_bp.route('/interview', methods=['POST'])
def ai_interview():
    from utils.gemini_helper import assistant
    try:
        init_firebase()
        data = request.get_json()
        action = data.get('action', '')
        job_title = data.get('job_title', '')
        job_description = data.get('job_description', '')
        skills = data.get('skills', '')
        experience = data.get('experience', '')
        questions = data.get('questions', [])
        answers = data.get('answers', [])

        if not job_title:
            return jsonify({'error': 'job_title is required'}), 400

        if action == 'start':
            prompt = f"""Generate 5 interview questions for a {job_title} position.
Job Description: {job_description}
Candidate Skills: {skills}
Candidate Experience: {experience}

Return ONLY a JSON array of 5 question strings. No other text.
Example: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]"""

            response, error = assistant.chat([{"role": "user", "content": prompt}])
            if error:
                return jsonify({'error': error}), 500

            import re
            match = re.search(r'\[.*?\]', response, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
            else:
                parsed = response.strip().split('\n')[:5]
                parsed = [q.lstrip('0123456789.)- ') for q in parsed if q.strip()]

            return jsonify({'success': True, 'questions': parsed[:5]}), 200

        elif action == 'answer':
            current_question = data.get('current_question', '')
            current_answer = data.get('current_answer', '')
            next_question = data.get('next_question', '')
            question_number = data.get('question_number', 1)
            total_questions = data.get('total_questions', 5)
            prev_responses = data.get('prev_responses', [])

            context = ""
            if prev_responses:
                context = "Previous questions and answers in this interview:\n"
                for pr in prev_responses:
                    context += f"Q: {pr.get('question', '')}\nA: {pr.get('answer', '')}\n\n"

            prompt = f"""You are a human interviewer conducting a face-to-face interview for a {job_title} position.
Job Description: {job_description}
Candidate Skills: {skills}
Candidate Experience: {experience}

{context}
You just asked: "{current_question}"
The candidate answered: "{current_answer}"

React to this answer EXACTLY like a real human interviewer would:
- Be conversational, natural, and varied in your reactions
- Sometimes acknowledge strengths, sometimes probe deeper, sometimes challenge, sometimes just nod and move on
- Vary your tone — don't always say "good answer" or "great"
- If the answer is weak, you can react with subtle disappointment or probing follow-up
- If the answer is strong, show genuine interest or satisfaction
- Keep it concise (1-3 sentences max for the reaction)

Then naturally transition to the next question (Question {question_number} of {total_questions}):
"{next_question}"

Return ONLY your response as the interviewer speaking directly to the candidate. No labels, no JSON, no explanations.
Example tone: "I appreciate how you handled that — it's clear you've thought deeply about this. Let me ask you something different..." followed by the next question.

Make each response unique and realistic — never repeat the same pattern."""

            response, error = assistant.chat([{"role": "user", "content": prompt}])
            if error:
                return jsonify({'error': error}), 500

            return jsonify({'success': True, 'reply': response}), 200

        elif action == 'evaluate':
            qa_pairs = []
            for i, q in enumerate(questions):
                ans = answers[i] if i < len(answers) else ''
                qa_pairs.append(f"Q: {q}\nA: {ans}")

            prompt = f"""You conducted a mock interview for a {job_title} position.
Job Description: {job_description}
Candidate Skills: {skills}

Here are the questions and answers:
{chr(10).join(qa_pairs)}

Provide:
1. A score out of 100 (be honest and critical)
2. A brief assessment of the candidate's performance
3. Specific improvement suggestions for each answer

Return your response in this JSON format ONLY (no other text):
{{"score": 75, "assessment": "brief assessment text", "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}}"""

            response, error = assistant.chat([{"role": "user", "content": prompt}])
            if error:
                return jsonify({'error': error}), 500

            import re
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                result = json.loads(match.group())
            else:
                result = {"score": 70, "assessment": "Interview completed.", "suggestions": ["Review your answers and practice more."]}

            return jsonify({'success': True, 'result': result}), 200

        return jsonify({'error': 'Invalid action. Use "start", "answer", or "evaluate".'}), 400

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500