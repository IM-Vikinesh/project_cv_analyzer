import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatbotAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';

const WELCOME_BY_ROLE = {
  job_seeker: {
    role: 'assistant',
    content: "Hi! I'm **JobNex AI Career Assistant**. I can help you improve your CV, discover trending skills, prepare for interviews, and find the perfect job.\n\nHow can I assist you today?",
    timestamp: new Date().toISOString()
  },
  recruiter: {
    role: 'assistant',
    content: "Hi! I'm **JobNex AI Career Assistant**. I can help you review candidate CVs, create job descriptions, prepare interview questions, and optimize your hiring process.\n\nHow can I assist you today?",
    timestamp: new Date().toISOString()
  },
  admin: {
    role: 'assistant',
    content: "Hi! I'm **JobNex AI Career Assistant**. I can help you manage the platform, review analytics, moderate content, and optimize system performance.\n\nHow can I assist you today?",
    timestamp: new Date().toISOString()
  }
};

const ChatWindow = ({ onClose }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'job_seeker';
  const WELCOME_MESSAGE = WELCOME_BY_ROLE[userRole] || WELCOME_BY_ROLE.job_seeker;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  const LIMIT_INFO = {
    role: 'system',
    content: "**Note:** You have **10 AI interactions** available per day. Your limit resets every 12 hours.",
    timestamp: new Date().toISOString()
  };

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => { loadHistory(); // eslint-disable-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => {
    if (!isLoading && historyLoaded) inputRef.current?.focus();
  }, [isLoading, historyLoaded]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        const btn = document.querySelector('[aria-label="Open chat"], [aria-label="Close chat"]');
        if (btn && btn.contains(e.target)) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const loadHistory = async () => {
    try {
      const response = await chatbotAPI.getHistory();
      if (response.data?.success && response.data?.messages?.length > 0) {
        const formatted = response.data.messages.map((msg) => ({
          role: msg.role, content: msg.content, timestamp: msg.timestamp
        }));
        setMessages([LIMIT_INFO, ...formatted]);
        setSessionId(response.data.session_id);
        setShowSuggestions(false);
      } else {
        setMessages([WELCOME_MESSAGE, LIMIT_INFO]);
        setShowSuggestions(true);
      }
    } catch {
      setMessages([WELCOME_MESSAGE, LIMIT_INFO]);
      setShowSuggestions(true);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const sendMessage = async (text) => {
    const message = text || input;
    if (!message.trim() || isLoading) return;
    const userMessage = {
      role: 'user', content: message.trim(), timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); setIsLoading(true); setShowSuggestions(false);
    try {
      const response = await chatbotAPI.chat({ message: message.trim(), session_id: sessionId });
      if (response.data?.success) {
        const aiMessage = {
          role: 'assistant', content: response.data.response, timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (response.data.session_id) setSessionId(response.data.session_id);
      } else {
        throw new Error(response.data?.error || 'Failed to get response');
      }
    } catch (error) {
      const errorDetail = error.response?.data?.error || error.message || 'Unable to connect to the AI service.';
      const isLimit = error.response?.status === 429;
      const content = isLimit
        ? 'I apologize, but ' + errorDetail
        : 'I apologize, but I encountered an issue: ' + errorDetail + '\n\n**Tip:** If this persists, ensure a valid `GOOGLE_API_KEY` (Gemini) or `OPENAI_API_KEY` is configured in the backend `.env` file.';
      setMessages((prev) => [...prev, { role: 'assistant', content, timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };
  const handlePromptSelect = (message) => { sendMessage(message); };
  const clearChat = () => {
    setMessages([WELCOME_MESSAGE, LIMIT_INFO]); setSessionId(null); setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const sizeClass = maximized
    ? 'fixed inset-0 z-50 w-full h-full sm:inset-8 sm:rounded-2xl sm:w-auto sm:h-auto'
    : 'fixed bottom-24 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[600px] max-h-[calc(100vh-120px)]';

  return (
    <div ref={chatRef} className={`${sizeClass} bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up`}>
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">JobNex Career AI</h3>
            <p className="text-white/70 text-[10px]"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse mr-1" /> Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMaximized(!maximized)} className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10" title={maximized ? 'Minimize' : 'Maximize'}>
            {maximized ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V9a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H9a1 1 0 010 2H5a1 1 0 01-1-1v-4zm13 0a1 1 0 012 0v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L19 13.586V12z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V9a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H9a1 1 0 010 2H5a1 1 0 01-1-1v-4zm13 0a1 1 0 012 0v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L19 13.586V12z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button onClick={clearChat} className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10" title="New conversation">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/50 scrollbar-hide">
        {messages.map((msg, index) => {
          if (msg.role === 'system') {
            return (
              <div key={index} className="flex justify-center mb-3">
                <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2 text-xs text-primary-700 max-w-[90%] text-center">
                  {msg.content}
                </div>
              </div>
            );
          }
          return <MessageBubble key={index} message={msg} />;
        })}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-sm">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Suggested Prompts */}
      {showSuggestions && historyLoaded && !isLoading && messages.filter(m => m.role !== 'system').length <= 1 && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white">
          <SuggestedPrompts role={userRole} onSelect={handlePromptSelect} />
        </div>
      )}
      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type your message..." disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50 transition-all duration-200"
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
