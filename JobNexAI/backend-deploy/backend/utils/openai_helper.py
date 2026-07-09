import os
import json

client = None
_openai_available = False

try:
    from openai import OpenAI
    _openai_available = True
except ImportError:
    _openai_available = False


def init_openai():
    global client
    if not _openai_available:
        return False
    api_key = os.environ.get('OPENAI_API_KEY')
    if api_key and not client:
        client = OpenAI(api_key=api_key)
    return client is not None


def generate_cover_letter(job_title, company, job_description, applicant_name, applicant_skills=None, applicant_experience=None):
    if not client:
        init_openai()
    
    if not client:
        return None, "OpenAI not configured. Please set OPENAI_API_KEY environment variable."
    
    skills_text = ""
    if applicant_skills:
        if isinstance(applicant_skills, list):
            skills_text = ", ".join(applicant_skills)
        else:
            skills_text = str(applicant_skills)
    
    experience_text = ""
    if applicant_experience:
        experience_text = f"\n\nApplicant Experience:\n{applicant_experience}"
    
    prompt = f"""Write a professional cover letter for the following job application:

Position: {job_title}
Company: {company}

Job Description:
{job_description}

{"Applicant Name: " + applicant_name if applicant_name else ""}
{skills_text}
{experience_text}

The cover letter should:
1. Be 3-4 paragraphs
2. Capture the reader's attention with a strong opening
3. Highlight relevant skills and experiences that match the job requirements
4. Show enthusiasm for the role and company
5. End with a call to action
6. Be professional but personable
7. NOT use placeholder text - make it specific to this job and company

Format the output as a plain text cover letter ready to be sent."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional career coach and resume writer with years of experience helping job seekers land their dream jobs."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        cover_letter = response.choices[0].message.content
        return cover_letter, None
    
    except Exception as e:
        return None, f"OpenAI API error: {str(e)}"


def generate_resume_summary(resume_text):
    if not client:
        init_openai()
    
    if not client:
        return None, "OpenAI not configured"
    
    prompt = f"""Analyze this resume and provide a brief professional summary (3-4 sentences) that could be used on a CV or LinkedIn profile:

{resume_text[:3000]}

The summary should:
1. Highlight the person's main professional strengths
2. Mention years of experience or key achievements
3. Include their most important technical/soft skills
4. Be written in third person
5. Be professional and impactful"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert career coach and professional resume writer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.6
        )
        
        summary = response.choices[0].message.content
        return summary, None
    
    except Exception as e:
        return None, f"OpenAI API error: {str(e)}"


def suggest_improvements(resume_text, job_description):
    if not client:
        init_openai()
    
    if not client:
        return None, "OpenAI not configured"
    
    prompt = f"""As an ATS (Applicant Tracking System) expert, analyze this resume against the job description and provide specific, actionable improvement suggestions:

RESUME:
{resume_text[:2500]}

JOB DESCRIPTION:
{job_description[:1500]}

Provide suggestions in these categories:
1. Keywords to add
2. Skills to highlight
3. Experience to emphasize
4. Formatting/structure improvements
5. ATS optimization tips

Be specific and actionable."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert ATS consultant with deep knowledge of resume optimization."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.5
        )
        
        suggestions = response.choices[0].message.content
        return suggestions, None
    
    except Exception as e:
        return None, f"OpenAI API error: {str(e)}"
