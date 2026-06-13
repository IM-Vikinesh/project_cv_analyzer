import os
import json
import traceback
import time

SYSTEM_PROMPT = """You are JobNex AI Career Assistant, an AI-powered career guidance system integrated into the JobNex AI platform.

Your purpose is to help users improve their careers, skills, CVs, interview performance, and job opportunities.

CORE RESPONSIBILITIES:
1. Career Guidance - Help users choose career paths, identify suitable roles, and plan professional growth
2. Skill Development - Recommend skills to learn, projects to build, and certifications to pursue
3. CV Improvement - Review and enhance CV content with ATS-friendly suggestions
4. Interview Preparation - Conduct mock interviews, generate questions, and evaluate responses
5. Job Recommendations - Match users with suitable opportunities and identify skill gaps
6. Industry Insights - Share current trends, market conditions, and future predictions

GUIDELINES:
- Provide accurate, practical, professional, and encouraging guidance
- Always prioritize career growth, employability, industry best practices, and learning recommendations
- When recommending skills, explain why they are valuable in the current job market
- When improving CV content, provide specific ATS-friendly suggestions with before/after examples
- When conducting interviews, evaluate answers constructively and provide actionable feedback
- Keep responses concise but comprehensive
- Be honest about skill gaps but frame them as opportunities for growth
- Tailor responses to the user's specific context (skills, experience, goals)

FORMATTING RULES (strictly follow these):
- Use ONLY these markdown elements: **bold**, `inline code`, bullet lists, numbered lists, and ### headings for sections
- Use ### for section headings only when you have 2+ sections
- Keep paragraphs short (2-3 sentences max per paragraph)
- Use bullet lists for items, not numbered lists unless it's a ranked sequence
- Put a blank line between sections
- Never use tables, blockquotes, or horizontal rules
- Never use *italic* — use **bold** for emphasis only
- Keep the overall response under 500 words unless the user asks for details

Remember: You are helping real people advance their careers. Be supportive, specific, and actionable."""


GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite']


class AIAssistant:
    def __init__(self):
        self.gemini_models = []
        self.openai_client = None
        self._openai_model = 'gpt-4o-mini'
        self._initialized = False
        self._provider = None

    def initialize(self):
        if self._initialized:
            return True

        self._init_gemini()
        if self.gemini_models:
            self._initialized = True
            self._provider = 'gemini'
            models_str = ', '.join(m[0] for m in self.gemini_models)
            print(f"AI Assistant: Using Gemini API ({models_str})")

        self._init_openai()
        if self.openai_client and not self._initialized:
            self._initialized = True
            self._provider = 'openai'
            print("AI Assistant: Using OpenAI API (fallback)")

        if not self._initialized:
            if self.gemini_models:
                self._provider = 'gemini'
                return True
            return False
        return True

    def _init_gemini(self):
        api_key = os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            return
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            for model_name in GEMINI_MODELS:
                try:
                    m = genai.GenerativeModel(model_name)
                    self.gemini_models.append((model_name, m))
                except Exception:
                    pass
            if self.gemini_models:
                models_str = ', '.join(m[0] for m in self.gemini_models)
                print(f"AI Assistant: Gemini initialized ({models_str})")
        except Exception as e:
            print(f"Gemini init error: {e}")

    def _init_openai(self):
        openai_key = os.environ.get('OPENAI_API_KEY')
        openrouter_key = os.environ.get('OPENROUTER_API_KEY')
        if not openai_key and not openrouter_key:
            return
        try:
            from openai import OpenAI
            if openrouter_key and openrouter_key.startswith('sk-or-v1'):
                self.openai_client = OpenAI(
                    api_key=openrouter_key,
                    base_url='https://openrouter.ai/api/v1'
                )
                self._openai_model = 'gpt-4o-mini'
                print("AI Assistant: OpenRouter initialized")
            elif openai_key:
                self.openai_client = OpenAI(api_key=openai_key)
                self._openai_model = 'gpt-4o-mini'
                print("AI Assistant: OpenAI initialized")
        except Exception as e:
            print(f"OpenAI/OpenRouter init error: {e}")

    def _build_context(self, user_context=None):
        context = SYSTEM_PROMPT
        if user_context:
            parts = []
            if user_context.get('name'):
                parts.append(f"User Name: {user_context['name']}")
            if user_context.get('skills'):
                parts.append(f"User Skills: {user_context['skills']}")
            if user_context.get('experience'):
                parts.append(f"User Experience: {user_context['experience']}")
            if user_context.get('education'):
                parts.append(f"User Education: {user_context['education']}")
            if user_context.get('career_goals'):
                parts.append(f"User Career Goals: {user_context['career_goals']}")
            if user_context.get('cv_text'):
                parts.append(f"User CV/Resume Content:\n{user_context['cv_text'][:2000]}")

            if parts:
                context += "\n\n=== USER CONTEXT ===\n" + "\n".join(parts) + "\n=================="

        return context

    def chat(self, messages, user_context=None):
        if not self._initialized:
            if not self.initialize():
                return None, "AI service is not configured. Please contact the administrator."

        system_context = self._build_context(user_context)

        if self._provider == 'gemini':
            response, error = self._chat_gemini(messages, system_context)
            if response is not None:
                return response, None
            if self.openai_client:
                return self._chat_openai(messages, system_context)
            return response, error

        elif self._provider == 'openai':
            response, error = self._chat_openai(messages, system_context)
            if response is not None:
                return response, None
            if self.gemini_models:
                return self._chat_gemini(messages, system_context)
            return response, error

        return None, "No AI provider available."

    def _chat_gemini(self, messages, system_context):
        last_error = None
        for model_name, _ in self.gemini_models:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel(
                    model_name,
                    system_instruction=system_context
                )

                history = []
                for msg in messages[:-1]:
                    role = "user" if msg["role"] == "user" else "model"
                    history.append({"role": role, "parts": [msg["content"]]})

                last_content = messages[-1]["content"] if messages else "Hello"

                if history:
                    chat = model.start_chat(history=history)
                    response = chat.send_message(last_content)
                else:
                    response = model.generate_content(last_content)

                return response.text, None

            except Exception as e:
                last_error = e
                error_str = str(e)
                if 'RESOURCE_EXHAUSTED' in error_str or 'quota' in error_str.lower():
                    continue
                break

        traceback.print_exc()
        error_str = str(last_error) if last_error else "Unknown error"
        return None, (
            "The AI API quota has been exceeded for all available Gemini models. "
            "To fix this:\n"
            "1. Go to https://console.cloud.google.com/apis/enableflow?apiid=generativelanguage.googleapis.com\n"
            "2. Enable billing (you get $300 free credit, Gemini free tier remains free)\n"
            "3. Or get a fresh key at https://aistudio.google.com/apikey\n"
            "4. Or recharge your OpenAI account to use the existing OPENAI_API_KEY"
        )

    def _chat_openai(self, messages, system_context):
        if not self.openai_client:
            return None, "OpenAI/OpenRouter client not initialized."
        try:
            openai_messages = [{"role": "system", "content": system_context}]
            for msg in messages:
                openai_messages.append({"role": msg["role"], "content": msg["content"]})

            model = getattr(self, '_openai_model', 'gpt-4o-mini')
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=openai_messages,
                max_tokens=1024,
                temperature=0.7
            )

            return response.choices[0].message.content, None

        except Exception as e:
            traceback.print_exc()
            error_str = str(e)
            if 'insufficient_quota' in error_str or 'quota' in error_str.lower():
                return None, "The OpenAI API quota has been exceeded. Add a GOOGLE_API_KEY to your .env or recharge your OpenAI account."
            return None, f"AI generation error: {error_str}"


assistant = AIAssistant()
