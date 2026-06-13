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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && historyLoaded) {
      inputRef.current?.focus();
    }
  }, [isLoading, historyLoaded]);

  const loadHistory = async () => {
    try {
      const response = await chatbotAPI.getHistory();
      if (response.data?.success && response.data?.messages?.length > 0) {
        const formatted = response.data.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        setMessages(formatted);
        setSessionId(response.data.session_id);
        setShowSuggestions(false);
      } else {
        setMessages([WELCOME_MESSAGE]);
        setShowSuggestions(true);
      }
    } catch {
      setMessages([WELCOME_MESSAGE]);
      setShowSuggestions(true);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const sendMessage = async (text) => {
    const message = text || input;
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await chatbotAPI.chat({
        message: message.trim(),
        session_id: sessionId
      });

      if (response.data?.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (response.data.session_id) {
          setSessionId(response.data.session_id);
        }
      } else {
        throw new Error(response.data?.error || 'Failed to get response');
      }
    } catch (error) {
      const errorDetail = error.response?.data?.error || error.message || 'Unable to connect to the AI service.';
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue: ' + errorDetail + '\n\n**Tip:** If this persists, ensure a valid `GOOGLE_API_KEY` (Gemini) or `OPENAI_API_KEY` is configured in the backend `.env` file.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePromptSelect = (message) => {
    sendMessage(message);
  };

  const clearChat = async () => {
    setMessages([WELCOME_MESSAGE]);
    setSessionId(null);
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
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
            <p className="text-white/70 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          title="New conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/50 scrollbar-hide">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </svg>
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

      {showSuggestions && historyLoaded && !isLoading && messages.length <= 1 && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white">
          <SuggestedPrompts role={userRole} onSelect={handlePromptSelect} />
        </div>
      )}

      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50 transition-all duration-200"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
