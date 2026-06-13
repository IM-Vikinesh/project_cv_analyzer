import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

const TYPING_SPEED = 20;

const BotMessage = ({ content, isTyping }) => {
  const safeContent = typeof content === 'object' ? content?.description || '' : String(content || '');
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    if (isTyping) return;
    setDisplayedLength(0);
    const total = safeContent.length;
    if (total === 0) return;
    const charsPerTick = Math.max(1, Math.floor(total / 60));
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + charsPerTick;
        if (next >= total) { clearInterval(timer); return total; }
        return next;
      });
    }, TYPING_SPEED);
    return () => clearInterval(timer);
  }, [safeContent, isTyping]);

  const showTyping = !isTyping && displayedLength < safeContent.length;
  const displayText = showTyping ? safeContent.slice(0, displayedLength) : safeContent;

  if (showTyping) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayText}<span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse" /></p>;
  }
  return (
    <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:text-gray-700 prose-strong:text-gray-900">
      <ReactMarkdown>{safeContent}</ReactMarkdown>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start mb-4">
    <div className="flex items-start gap-2.5 max-w-[85%]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-sm">
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
      </div>
      <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-tl-md shadow-sm">
        <div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div>
      </div>
    </div>
  </div>
);

const AIInterview = () => {
  const { user } = useAuth();
  const [step, setStep] = useState('setup');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (!loading && step === 'interview') {
      inputRef.current?.focus();
    }
  }, [loading, step, currentQ]);

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content, timestamp: new Date().toISOString() }]);
  };

  const handleStart = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await aiAPI.interview({
        action: 'start', job_title: jobTitle, job_description: jobDescription,
        skills: user?.skills || '', experience: user?.experience || '',
      });
      if (res.data?.success) {
        const qs = res.data.questions;
        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(''));
        setCurrentQ(0);
        setMessages([]);
        addMessage('assistant', `# 🎯 Mock Interview: ${jobTitle}\n\nWelcome! I'll be your interview coach today. Let's begin with **Question 1.**\n\n${qs[0]}`);
        setStep('interview');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!input.trim() || loading) return;
    const answer = input.trim();
    setInput('');
    addMessage('user', answer);

    const updated = [...answers];
    updated[currentQ] = answer;
    setAnswers(updated);

    if (currentQ < questions.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      setLoading(true);

      const prevResponses = [];
      for (let i = 0; i < currentQ; i++) {
        if (updated[i]) prevResponses.push({ question: questions[i], answer: updated[i] });
      }

      try {
        const res = await aiAPI.interview({
          action: 'answer', job_title: jobTitle, job_description: jobDescription,
          skills: user?.skills || '', experience: user?.experience || '',
          current_question: questions[currentQ], current_answer: answer,
          next_question: questions[nextQ], question_number: nextQ + 1,
          total_questions: questions.length, prev_responses: prevResponses,
        });
        if (res.data?.success) {
          addMessage('assistant', res.data.reply);
        } else {
          addMessage('assistant', `**Question ${nextQ + 1}:**\n\n${questions[nextQ]}`);
        }
      } catch {
        addMessage('assistant', `**Question ${nextQ + 1}:**\n\n${questions[nextQ]}`);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await aiAPI.interview({
          action: 'evaluate', job_title: jobTitle, job_description: jobDescription,
          skills: user?.skills || '', experience: user?.experience || '',
          questions, answers: updated,
        });
        if (res.data?.success) {
          const r = res.data.result;
          setResult(r);
          const scoreColor = r.score >= 80 ? '🟢' : r.score >= 60 ? '🟡' : '🔴';
          addMessage('assistant', `# 📊 Interview Complete!\n\n${scoreColor} **Your Score: ${r.score}/100**\n\n**Assessment:**\n${r.assessment}\n\n${r.suggestions?.length > 0 ? '**Improvement Tips:**\n' + r.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') : ''}\n\n---\n\nWant to try another interview? Just click **Try Another** below!`);
          setStep('results');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to evaluate answers');
        addMessage('assistant', 'Sorry, I encountered an error evaluating your answers. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) handleSendAnswer();
    }
  };

  const resetAll = () => {
    setStep('setup'); setQuestions([]); setAnswers([]); setCurrentQ(0);
    setMessages([]); setResult(null); setInput(''); setError('');
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Mock Interview</h1>
            <p className="text-gray-500 mt-2">Practice with AI-generated questions in a natural conversation</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="input-field" placeholder="e.g. Software Engineer, Marketing Manager" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={4} className="input-field" placeholder="Paste the job description here for targeted questions..." />
              </div>
              {user?.skills && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.split(',').map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleStart} disabled={loading || !jobTitle.trim()} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Starting...</> : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">AI Interview Coach</h2>
            <p className="text-xs text-gray-500">{jobTitle} — Question {currentQ + 1} of {questions.length}</p>
          </div>
        </div>
        {step === 'results' && (
          <button onClick={resetAll} className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium">
            Try Another
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 last:mb-0`}>
            <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5 max-w-[85%]`}>
              {msg.role !== 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-sm">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
                </div>
              )}
              <div>
                <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-tr-md' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-md'}`}>
                  <BotMessage content={msg.content} isTyping={false} />
                </div>
                <p className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-sm">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        {error && step === 'interview' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {step === 'interview' && !result && (
        <div className="bg-white border-t border-gray-100 px-4 py-4 shadow-lg">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 input-field rounded-xl px-4 py-3"
              placeholder={currentQ < questions.length ? 'Type your answer... (Enter to send)' : ''}
              autoFocus
            />
            <button
              onClick={handleSendAnswer}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="bg-white border-t border-gray-100 px-4 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <button onClick={resetAll} className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-center">
              Try Another Interview
            </button>
            <button onClick={() => window.location.href = '/dashboard'} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-center">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInterview;
