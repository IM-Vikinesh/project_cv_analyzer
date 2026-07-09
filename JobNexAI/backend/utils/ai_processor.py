import os
import re
import json
from datetime import datetime
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from pdfminer.high_level import extract_text
from utils.gemini_helper import assistant

nltk_data_dir = os.environ.get('NLTK_DATA', '/tmp/nltk_data')
os.makedirs(nltk_data_dir, exist_ok=True)
nltk.data.path.insert(0, nltk_data_dir)

try:
    stop_words = set(stopwords.words('english'))
except Exception:
    try:
        nltk.download('stopwords', download_dir=nltk_data_dir, quiet=True)
        nltk.download('punkt', download_dir=nltk_data_dir, quiet=True)
        nltk.download('averaged_perceptron_tagger', download_dir=nltk_data_dir, quiet=True)
        nltk.download('punkt_tab', download_dir=nltk_data_dir, quiet=True)
        stop_words = set(stopwords.words('english'))
    except Exception:
        stop_words = set()


openai_client = None

def init_openai():
    global openai_client
    if openai_client:
        return True

    keys_to_try = [
        os.environ.get('OPENROUTER_API_KEY'),
        os.environ.get('OPENAI_API_KEY'),
    ]
    api_key = next((k for k in keys_to_try if k), None)
    if not api_key:
        return False

    try:
        from openai import OpenAI
        if api_key.startswith('sk-or-v1'):
            openai_client = OpenAI(api_key=api_key, base_url='https://openrouter.ai/api/v1')
        else:
            openai_client = OpenAI(api_key=api_key)
        return True
    except Exception as e:
        print(f"Failed to init OpenAI: {e}")
        return False


def advanced_ai_analyze(text):
    if not text:
        return None

    prompt = f"""You are an expert resume analyzer. Analyze this resume text and extract structured information. Return ONLY a valid JSON object with these fields (no other text):

1. "experience": Array of work experiences, each with {{"company": company name, "role": job title, "duration": time period, "description": your detailed analysis of responsibilities and achievements}}

2. "education": Array of education entries, each with {{"institution": school name, "degree": degree name, "field": field of study, "year": graduation year}}
  
3. "organizations": Array of company/organization names mentioned in the resume

4. "skills": Array of technical and soft skills found (not already mentioned - look for new ones)

5. "achievements": Array of notable achievements or accomplishments found

6. "summary": A 2-3 sentence professional summary of the candidate

Resume text to analyze:
{text[:4000]}

Return JSON only:"""

    try:
        messages = [{"role": "user", "content": prompt}]
        result_text = None

        assistant.initialize()
        resp, err = assistant.chat(messages)
        if not err and resp:
            result_text = resp

        if not result_text and init_openai() and openai_client:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert resume parser. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            result_text = response.choices[0].message.content

        if not result_text:
            return None

        result = result_text.strip()
        if result.startswith('```json'):
            result = result[7:]
        if result.startswith('```'):
            result = result[3:]
        if result.endswith('```'):
            result = result[:-3]

        return json.loads(result.strip())

    except json.JSONDecodeError as e:
        print(f"AI JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"AI analysis error: {e}")
        return None


def extract_text_from_pdf(pdf_path):
    text = None
    last_error = None
    
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(pdf_path)
    except Exception as e:
        last_error = e
        print(f"pdfminer failed: {e}")
    
    if not text or not text.strip():
        try:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
        except Exception as e:
            last_error = e
            print(f"pdfplumber failed: {e}")
    
    if not text or not text.strip():
        try:
            from pypdf import PdfReader
            reader = PdfReader(pdf_path)
            text = '\n'.join(page.extract_text() or '' for page in reader.pages)
        except Exception as e:
            last_error = e
            print(f"pypdf failed: {e}")
    
    if not text or not text.strip():
        try:
            import fitz
            doc = fitz.open(pdf_path)
            text = ''
            for page in doc:
                text += page.get_text() + '\n'
            doc.close()
        except Exception as e:
            last_error = e
            print(f"PyMuPDF failed: {e}")
    
    if not text or not text.strip():
        try:
            import fitz
            doc = fitz.open(pdf_path)
            text = ''
            for page_num in range(len(doc)):
                page = doc[page_num]
                blocks = page.get_text("blocks")
                for block in blocks:
                    if len(block) >= 5:
                        text += block[4] + '\n'
            doc.close()
        except Exception as e:
            last_error = e
            print(f"PyMuPDF blocks extraction failed: {e}")
    
    if not text or not text.strip():
        try:
            import fitz
            import pytesseract
            from PIL import Image
            doc = fitz.open(pdf_path)
            text = ''
            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap(dpi=300)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text += pytesseract.image_to_string(img) + '\n'
            doc.close()
        except Exception as e:
            last_error = e
            print(f"Tesseract OCR failed: {e}")
    
    if not text or not text.strip():
        print("Falling back to AI Vision API for OCR...")
        try:
            if not init_openai():
                last_error = Exception("No AI API key configured for OCR fallback.")
            else:
                import fitz
                import base64
                doc = fitz.open(pdf_path)
                images = []
                for page_num in range(min(len(doc), 3)):
                    page = doc[page_num]
                    pix = page.get_pixmap(dpi=150)
                    img_data = pix.tobytes("png")
                    b64_img = base64.b64encode(img_data).decode('utf-8')
                    images.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{b64_img}"
                        }
                    })
                doc.close()
                
                if images:
                    content = [{"type": "text", "text": "Extract all text from these resume pages. Return ONLY the raw text without any markdown or commentary."}]
                    content.extend(images)
                    
                    response = openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": content}],
                        max_tokens=2500
                    )
                    text = response.choices[0].message.content
        except Exception as e:
            last_error = e
            print(f"AI Vision OCR failed: {e}")

    if not text or not text.strip():
        raise Exception(f"This appears to be an image-based PDF. To process it, configure a GOOGLE_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY in the backend/.env file, or install Tesseract OCR on your system. Technical detail: {last_error}")
    
    return text


def extract_contact_info(text):
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    
    return {
        'emails': emails,
        'phones': [p for p in phones if len(p) >= 10]
    }


def extract_skills(text):
    skill_keywords = [
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'php', 'scala', 'r', 'dart', 'matlab', 'perl', 'haskell', 'lua',
        'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'express', 'next.js', 'nuxt', 'laravel', 'ruby on rails', 'asp.net', 'fastapi', 'svelte', 'jquery',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'oracle', 'sqlite', 'mariadb', 'couchbase',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'circleci', 'github actions', 'gitlab ci', 'heroku', 'digitalocean', 'nginx', 'apache',
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'nlp', 'computer vision', 'data analysis', 'data science', 'artificial intelligence', 'big data', 'hadoop', 'spark', 'kafka',
        'html', 'html5', 'css', 'css3', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'chakra ui',
        'git', 'github', 'gitlab', 'bitbucket', 'agile', 'scrum', 'jira', 'confluence', 'trello', 'asana', 'slack', 'linux', 'unix', 'bash', 'shell scripting', 'powershell',
        'rest api', 'graphql', 'microservices', 'serverless', 'system design', 'oop', 'solid', 'design patterns', 'mvc', 'tdd', 'bdd',
        'project management', 'team leadership', 'communication', 'problem solving', 'critical thinking', 'time management', 'teamwork', 'leadership', 'public speaking', 'negotiation', 'agile methodologies',
        'excel', 'powerpoint', 'word', 'tableau', 'power bi', 'looker', 'salesforce', 'hubspot',
        'networking', 'security', 'cloud computing', 'devops', 'cybersecurity', 'penetration testing', 'cryptography', 'tcp/ip', 'dns', 'http'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in skill_keywords:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill.title() if len(skill) > 3 else skill.upper())
    
    return list(set(found_skills))


def extract_experience(text, ai_result=None):
    if ai_result and ai_result.get('experience'):
        return ai_result['experience']
    
    text_lower = text.lower()
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    experience_data = []
    current_role = ''
    current_company = ''
    current_duration = ''
    current_description = []
    capturing = False
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        if any(kw in line_lower for kw in ['experience', 'employment', 'work history', 'professional experience', 'career history']):
            if len(line) < 50:
                capturing = True
                continue
        
        if capturing and len(line) < 50 and any(line_lower.startswith(kw) or line_lower.strip() == kw or line_lower.strip() == kw+':' for kw in ['education', 'skills', 'certifications', 'projects', 'languages', 'references', 'awards', 'summary']):
            if current_description or current_role or current_company:
                experience_data.append({
                    'company': current_company,
                    'role': current_role,
                    'duration': current_duration,
                    'description': ' '.join(current_description)[:500]
                })
            capturing = False
            current_role = ''
            current_company = ''
            current_duration = ''
            current_description = []
            continue
        
        if capturing and line:
            duration_patterns = [
                r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[-–—to]+\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?[a-z]*\s+\d{4}',
                r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[-–—to]+\s+present',
                r'\b(20[0-2]\d|19[5-9]\d)\s*[-–—to]+\s*(20[0-2]\d|19[5-9]\d|present|current)\b',
                r'\d{4}\s*[-–—to]+\s*\d{4}',
                r'\d{4}\s*[-–—to]+\s+present',
            ]
            
            matched_duration = False
            for pattern in duration_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match and not current_duration:
                    current_duration = match.group(0)
                    line = re.sub(pattern, '', line, flags=re.IGNORECASE).strip()
                    matched_duration = True
                    break
            
            company_patterns = [
                r'\b([A-Z][a-zA-Z\s&,-]+(?:Inc|LLC|Corp|Ltd|Company|Co\.|Technologies|Solutions|Systems|Services|Consulting|Group|Partners|Bank|Hospital))\b'
            ]
            for pattern in company_patterns:
                match = re.search(pattern, line)
                if match and not current_company:
                    current_company = match.group(1).strip()
                    continue
            
            role_keywords = ['manager', 'engineer', 'developer', 'analyst', 'consultant', 'director', 'lead', 'specialist', 'coordinator', 'administrator', 'designer', 'architect', 'specialist', 'officer', 'head', 'chief', 'vp', 'vice president', 'supervisor', 'associate', 'assistant', 'technician']
            if any(kw in line_lower for kw in role_keywords) and len(line) < 60 and not matched_duration:
                if not current_role:
                    current_role = line
                elif current_description:
                    current_description.append(line)
                continue
            
            if line and len(line) > 3:
                current_description.append(line)
    
    if current_description or current_role or current_company:
        experience_data.append({
            'company': current_company,
            'role': current_role,
            'duration': current_duration,
            'description': ' '.join(current_description)[:500]
        })
    
    if not experience_data:
        current_entry = {}
        for line in lines:
            line_lower = line.lower()
            role_keywords = ['manager', 'engineer', 'developer', 'analyst', 'consultant', 'director', 'lead', 'specialist', 'coordinator', 'administrator', 'designer', 'architect', 'officer', 'head', 'chief', 'vp', 'president', 'supervisor', 'associate', 'assistant', 'technician']
            found_role = None
            if len(line) < 60 and any(kw in line_lower for kw in role_keywords):
                found_role = line.strip()
                
            found_company = re.search(r'\b([A-Z][a-zA-Z\s&,-]+(?:Inc|LLC|Corp|Ltd|Company|Co\.|Technologies|Solutions|Systems|Services|Consulting|Group|Partners|Bank|Hospital))\b', line)
            duration_match = re.search(r'\b(20[0-2]\d|19[5-9]\d)\s*[-–—to]+\s*(20[0-2]\d|19[5-9]\d|present|current)\b', line, re.IGNORECASE)
            
            if found_role or found_company or duration_match:
                if current_entry and (found_company or found_role):
                    if current_entry.get('company') or current_entry.get('role'):
                        experience_data.append(current_entry)
                        current_entry = {}
                
                if found_company:
                    current_entry['company'] = found_company.group(1).strip()
                if found_role and not current_entry.get('role'):
                    current_entry['role'] = found_role
                if duration_match and not current_entry.get('duration'):
                    current_entry['duration'] = duration_match.group(0)
                    
        if current_entry and (current_entry.get('company') or current_entry.get('role')):
            experience_data.append(current_entry)
            
    return experience_data if experience_data else [{'company': '', 'role': 'Professional Experience', 'duration': '', 'description': 'Details not clearly identified.'}]


def extract_education(text, ai_result=None):
    if ai_result and ai_result.get('education'):
        return {
            'entries': ai_result['education'],
            'degrees': [e.get('degree', '') for e in ai_result['education'] if e.get('degree')]
        }
    
    entries = []
    degrees_found = set()
    
    degree_map = {
        'phd': 'PhD', 'doctor of philosophy': 'PhD', 'doctorate': 'PhD', 'ph.d': 'PhD',
        'master of science': 'MSc', 'm.sc': 'MSc', 'm.s.': 'MSc', 'msc': 'MSc', 'master': 'Master', 'masters': 'Master',
        'master of arts': 'MA', 'm.a': 'MA',
        'mba': 'MBA', 'm.tech': 'MTech', 'mtech': 'MTech',
        'bachelor of science': 'BSc', 'b.sc': 'BSc', 'b.s.': 'BSc', 'bsc': 'BSc', 'bachelor': 'Bachelor', 'bachelors': 'Bachelor',
        'bachelor of engineering': 'BE', 'b.e.': 'BE', 'b.tech': 'BTech', 'btech': 'BTech',
        'bachelor of arts': 'BA', 'b.a': 'BA', 'bcs': 'BCS',
        'associate': 'Associate', 'a.s.': 'AS', 'a.a.': 'AA',
        'diploma': 'Diploma', 'high school': 'High School'
    }
    
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    current_entry = {}
    
    for line in lines:
        line_lower = line.lower()
        
        found_uni = re.search(r'\b([A-Z][a-zA-Z\s&,-]+(?:University|College|Institute|School|Academy|Polytechnic|Tech|Technology))\b', line)
        
        found_deg = None
        for key, deg in degree_map.items():
            if re.search(r'\b' + re.escape(key) + r'\b', line_lower):
                found_deg = deg
                degrees_found.add(deg)
                break
                
        years = re.findall(r'\b(20[0-2]\d|19[5-9]\d)\b', line)
        found_year = None
        if len(years) >= 2:
            found_year = f"{years[0]} - {years[1]}"
        elif years:
            found_year = years[0]
            
        if found_uni or found_deg:
            if current_entry and (current_entry.get('institution') and found_uni):
                entries.append(current_entry)
                current_entry = {}
                
            if found_uni:
                current_entry['institution'] = found_uni.group(1).strip()
            if found_deg and not current_entry.get('degree'):
                current_entry['degree'] = found_deg
            if found_year and not current_entry.get('year'):
                current_entry['year'] = found_year
        elif found_year and current_entry and not current_entry.get('year'):
            current_entry['year'] = found_year
            
    if current_entry and (current_entry.get('institution') or current_entry.get('degree')):
        entries.append(current_entry)
        
    if not entries:
        unis = re.findall(r'\b([A-Z][a-zA-Z\s&,-]+(?:University|College|Institute|School|Academy|Polytechnic|Tech|Technology))\b', text)
        for uni in list(set(unis))[:3]:
            entries.append({'institution': uni.strip(), 'degree': '', 'year': ''})
            
    return {
        'degrees': list(degrees_found),
        'entries': entries if entries else [{'institution': '', 'degree': '', 'field': '', 'year': ''}]
    }


def analyze_resume(cv_path):
    if not os.path.exists(cv_path):
        raise Exception("CV file not found")
    
    text = extract_text_from_pdf(cv_path)
    
    if not text.strip():
        raise Exception("Could not extract text from PDF")
    
    ai_result = advanced_ai_analyze(text)
    
    contact = extract_contact_info(text)
    skills = extract_skills(text)
    experience = extract_experience(text, ai_result)
    education = extract_education(text, ai_result)
    
    organizations = []
    if ai_result and ai_result.get('organizations'):
        organizations = ai_result['organizations']
    else:
        org_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b'
        potential_orgs = re.findall(org_pattern, text)
        org_keywords = ['Inc', 'LLC', 'Corp', 'Ltd', 'Company', 'Technologies', 'Solutions', 'Systems', 'Services', 'Consulting', 'Group', 'Partners', 'Bank', 'Hospital', 'University', 'Institute']
        for org in potential_orgs:
            if any(kw in org for kw in org_keywords):
                organizations.append(org)
        organizations = list(set(organizations))[:10]
    
    achievements = []
    if ai_result and ai_result.get('achievements'):
        achievements = ai_result['achievements']
    
    if ai_result and ai_result.get('summary'):
        ai_summary = ai_result['summary']
    else:
        ai_summary = f"Resume contains {len(text.split())} words with {len(skills)} identified skills"
    
    word_count = len(text.split())
    sentence_count = len(sent_tokenize(text)) if text else 0
    
    return {
        'success': True,
        'word_count': word_count,
        'sentence_count': sentence_count,
        'contact': contact,
        'skills': skills,
        'experience': experience,
        'education': education,
        'organizations': organizations,
        'achievements': achievements,
        'summary': ai_summary,
    }


def calculate_ats_score(resume_text, job_description):
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()
    
    job_words = set(re.findall(r'\b[a-z]+\b', job_lower))
    job_words = job_words - stop_words
    
    required_skills = []
    for skill in ['python', 'java', 'javascript', 'sql', 'aws', 'docker', 'kubernetes', 
                  'react', 'angular', 'node', 'django', 'flask', 'machine learning',
                  'data analysis', 'project management', 'agile', 'scrum', 'git']:
        if skill in job_lower:
            required_skills.append(skill)
    
    found_skills = []
    missing_skills = []
    
    for skill in required_skills:
        if skill in resume_lower:
            found_skills.append(skill)
        else:
            missing_skills.append(skill)
    
    keyword_matches = 0
    total_keywords = len(job_words)
    
    for keyword in job_words:
        if keyword in resume_lower:
            keyword_matches += 1
    
    keyword_score = (keyword_matches / max(total_keywords, 1)) * 50 if total_keywords > 0 else 0
    skill_score = (len(found_skills) / max(len(required_skills), 1)) * 30 if required_skills else 15
    length_score = 20 if len(resume_text.split()) > 200 else (len(resume_text.split()) / 200) * 20
    
    total_score = min(int(keyword_score + skill_score + length_score), 100)
    
    suggestions = []
    if missing_skills:
        suggestions.append(f"Consider adding these skills mentioned in job description: {', '.join(missing_skills[:5])}")
    if len(resume_text.split()) < 200:
        suggestions.append("Your resume seems short. Aim for at least 200 words of relevant content.")
    if 'experience' not in resume_lower:
        suggestions.append("Include a clear work experience section with specific achievements.")
    if 'education' not in resume_lower:
        suggestions.append("Add an education section to strengthen your application.")
    
    suggestions.append("Use action verbs and quantify achievements where possible.")
    suggestions.append("Tailor your resume for each application to maximize relevance.")
    
    return {
        'success': True,
        'score': total_score,
        'keyword_match_percentage': int((keyword_matches / max(total_keywords, 1)) * 100) if total_keywords > 0 else 0,
        'skills_match_percentage': int((len(found_skills) / max(len(required_skills), 1)) * 100) if required_skills else 100,
        'found_skills': found_skills,
        'missing_keywords': missing_skills + list(job_words - set(found_skills))[:10],
        'suggestions': suggestions,
        'analysis': {
            'total_keywords_analyzed': total_keywords,
            'keywords_matched': keyword_matches,
            'required_skills_count': len(required_skills),
            'skills_matched_count': len(found_skills)
        }
    }


def calculate_general_ats_score(resume_text, analysis_result):
    score_breakdown = {}
    word_count = len(resume_text.split())

    if word_count < 150:
        length_score = 10
    elif word_count < 300:
        length_score = 15
    elif word_count <= 800:
        length_score = 20
    else:
        length_score = 15
    score_breakdown['resume_length'] = {'score': length_score, 'max': 20, 'detail': f'{word_count} words'}

    skills = analysis_result.get('skills', [])
    skills_count = len(skills)
    if skills_count >= 15:
        skills_score = 25
    elif skills_count >= 10:
        skills_score = 20
    elif skills_count >= 5:
        skills_score = 15
    elif skills_count >= 3:
        skills_score = 10
    else:
        skills_score = 5
    score_breakdown['skills'] = {'score': skills_score, 'max': 25, 'detail': f'{skills_count} skills found'}

    exp = analysis_result.get('experience', [])
    has_descriptions = any(
        isinstance(e, dict) and len(e.get('description', '').strip()) > 50
        for e in exp
    )
    exp_count = len(exp)
    if exp_count >= 3 and has_descriptions:
        exp_score = 20
    elif exp_count >= 2:
        exp_score = 15
    elif exp_count >= 1:
        exp_score = 10
    else:
        exp_score = 5
    score_breakdown['experience'] = {'score': exp_score, 'max': 20, 'detail': f'{exp_count} roles'}

    edu = analysis_result.get('education', {})
    edu_entries = edu.get('entries', []) if isinstance(edu, dict) else (edu if isinstance(edu, list) else [])
    if edu_entries and any(e.get('institution') or e.get('degree') for e in edu_entries):
        edu_score = 15
    else:
        edu_score = 5
    score_breakdown['education'] = {'score': edu_score, 'max': 15, 'detail': f'{len(edu_entries)} entries' if edu_entries else 'None'}

    contact = analysis_result.get('contact', {})
    has_email = bool(contact.get('emails'))
    has_phone = bool(contact.get('phones'))
    if has_email and has_phone:
        contact_score = 10
    elif has_email:
        contact_score = 7
    else:
        contact_score = 3
    score_breakdown['contact_info'] = {'score': contact_score, 'max': 10, 'detail': 'Email + Phone' if has_email and has_phone else ('Email only' if has_email else 'Missing')}

    achievements = analysis_result.get('achievements', [])
    ach_count = len(achievements) if achievements else 0
    if ach_count >= 3:
        ach_score = 10
    elif ach_count >= 1:
        ach_score = 7
    else:
        ach_score = 3
    score_breakdown['achievements'] = {'score': ach_score, 'max': 10, 'detail': f'{ach_count} achievements'}

    total = min(
        length_score + skills_score + exp_score + edu_score + contact_score + ach_score,
        100
    )

    suggestions = []
    if word_count < 300:
        suggestions.append("Increase resume length to 300-800 words for better ATS compatibility.")
    if skills_count < 10:
        suggestions.append(f"Add more relevant skills. You currently have {skills_count}. Aim for 10+.")
    if exp_count < 2:
        suggestions.append("Include more detailed work experience entries with measurable achievements.")
    if not has_descriptions:
        suggestions.append("Add detailed descriptions to your experience entries with specific accomplishments and metrics.")
    if not has_email:
        suggestions.append("Include a professional email address at the top of your resume.")
    if ach_count < 3:
        suggestions.append("Add more achievements with quantifiable results (numbers, percentages, etc.).")
    if not edu_entries:
        suggestions.append("Include an education section to strengthen your resume.")
    suggestions.append("Use action verbs and quantify achievements where possible.")

    return {
        'success': True,
        'score': total,
        'breakdown': score_breakdown,
        'suggestions': suggestions,
    }


def recommend_jobs(user_skills, jobs):
    if not user_skills:
        return []
    
    user_skills_lower = [s.lower().strip() for s in user_skills]
    recommendations = []
    
    for job in jobs:
        job_skills = job.get('skills_required', '') or ''
        job_skills_list = [s.strip().lower() for s in job_skills.split(',')]
        
        if not job_skills_list or job_skills_list == ['']:
            job_text = (job.get('requirements', '') + ' ' + job.get('description', '')).lower()
            job_skills_list = [s for s in user_skills_lower if s in job_text]
        
        if not job_skills_list:
            continue
        
        matches = 0
        matched_skills = []
        
        for user_skill in user_skills_lower:
            for job_skill in job_skills_list:
                if user_skill in job_skill or job_skill in user_skill:
                    matches += 1
                    if job_skill not in matched_skills:
                        matched_skills.append(job_skill)
        
        if matches > 0:
            max_possible = max(len(user_skills_lower), len(job_skills_list))
            match_score = (matches / max_possible) * 100
            
            recommendations.append({
                'job': job,
                'match_score': int(match_score),
                'matched_skills': list(set(matched_skills)),
                'match_details': f"{matches} skill(s) matched"
            })
    
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    
    return recommendations[:20]


def recommend_with_gaps(skills, jobs):
    """
    Match user skills against jobs and identify skill gaps
    (skills required by matched jobs that the user doesn't have).
    Returns (recommendations, aggregated_skill_gaps).
    """
    if not skills:
        return [], []

    skills_lower = [s.lower().strip() for s in skills]
    recommendations = []
    all_gaps = []

    for job in jobs:
        job_skills = job.get('skills_required', '') or ''
        job_skills_list = [s.strip().lower() for s in job_skills.split(',')]

        if not job_skills_list or job_skills_list == ['']:
            job_text = (job.get('requirements', '') + ' ' + job.get('description', '')).lower()
            job_skills_list = [s for s in skills_lower if s in job_text]

        if not job_skills_list:
            continue

        matches = 0
        matched_skills = []
        missing_skills = []

        for job_skill in job_skills_list:
            found = False
            for user_skill in skills_lower:
                if user_skill in job_skill or job_skill in user_skill:
                    matches += 1
                    if job_skill not in matched_skills:
                        matched_skills.append(job_skill)
                    found = True
                    break
            if not found:
                missing_skills.append(job_skill)

        if matches > 0:
            max_possible = max(len(skills_lower), len(job_skills_list))
            match_score = (matches / max_possible) * 100

            recommendations.append({
                'job': job,
                'match_score': int(match_score),
                'matched_skills': list(set(matched_skills)),
                'missing_skills': list(set(missing_skills)),
                'match_details': f"{matches}/{len(job_skills_list)} skills matched"
            })

            all_gaps.extend(missing_skills)

    recommendations.sort(key=lambda x: x['match_score'], reverse=True)

    from collections import Counter
    gap_counts = Counter(all_gaps)
    skill_gaps = [{'skill': s.capitalize(), 'count': c} for s, c in gap_counts.most_common()]

    return recommendations[:20], skill_gaps
