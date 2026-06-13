import React, { useState, useEffect } from 'react';

const TYPING_SPEED = 15;

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [displayedLength, setDisplayedLength] = useState(isUser ? message.content.length : 0);

  useEffect(() => {
    if (isUser) return;
    setDisplayedLength(0);

    const total = message.content.length;
    if (total === 0) return;
    const charsPerTick = Math.max(1, Math.floor(total / 80));

    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + charsPerTick;
        if (next >= total) {
          clearInterval(timer);
          return total;
        }
        return next;
      });
    }, TYPING_SPEED);

    return () => clearInterval(timer);
  }, [message.content, isUser]);

  const renderContent = (content) => {
    if (!content) return '';

    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-gray-800">$2</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-primary-700 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/^### (.+)/gm, '<h3 class="text-base font-bold text-gray-900 mt-4 mb-1">$1</h3>')
      .replace(/^## (.+)/gm, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)/gm, '<h1 class="text-xl font-bold text-gray-900 mt-5 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^---+/gm, '<hr class="my-3 border-gray-200" />');

    const lines = html.split('\n');
    const result = [];
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const ulMatch = line.match(/^<li class="text-gray-700 ml-4 list-disc">(.+)<\/li>$/);
      const olMatch = line.match(/^<li class="text-gray-700 ml-4 list-decimal">(.+)<\/li>$/);

      if (ulMatch) {
        if (!inUl) { result.push('<ul class="list-disc pl-5 my-2 space-y-1">'); inUl = true; }
        if (inOl) { result.push('</ol>'); inOl = false; }
        result.push(`<li class="text-gray-700 pl-1">${ulMatch[1]}</li>`);
      } else if (olMatch) {
        if (!inOl) { result.push('<ol class="list-decimal pl-5 my-2 space-y-1">'); inOl = true; }
        if (inUl) { result.push('</ul>'); inUl = false; }
        result.push(`<li class="text-gray-700 pl-1">${olMatch[1]}</li>`);
      } else {
        if (inUl) { result.push('</ul>'); inUl = false; }
        if (inOl) { result.push('</ol>'); inOl = false; }
        result.push(line);
      }
    }
    if (inUl) result.push('</ul>');
    if (inOl) result.push('</ol>');

    html = result.join('\n');
    html = html.replace(/^([^<].+)$/gm, '<p class="text-gray-700 mb-2">$1</p>');
    html = html.replace(/<p class="text-gray-700 mb-2"><\/p>/g, '');
    html = html.replace(/<p class="text-gray-700 mb-2">\s*<\/(?:ul|ol|pre|h[1-3]|hr)>\s*<\/p>/g, '');
    html = html.replace(/<(?:ul|ol|li|h[1-3]|hr|pre)\b[^>]*>\s*<\/p>/g, '');

    return html;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 last:mb-0`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5 max-w-[85%]`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </svg>
          </div>
        )}

        <div>
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
              isUser
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-tr-md'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-md'
            }`}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : displayedLength < message.content.length ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content.slice(0, displayedLength)}
                <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse" />
              </p>
            ) : (
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
              />
            )}
          </div>

          {message.timestamp && (
            <p className={`text-[10px] text-gray-400 mt-1 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
