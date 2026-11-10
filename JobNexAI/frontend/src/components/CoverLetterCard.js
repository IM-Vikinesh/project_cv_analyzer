import React, { useState } from 'react';

const CoverLetterCard = ({ text, className = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const trimmed = (text || '').trim();
  if (!trimmed) return null;

  const isLong = trimmed.length > 420;
  const showFull = expanded || !isLong;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      // Clipboard not available; ignore silently.
    }
  };

  return (
    <div className={`rounded-2xl liquid-glass overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/40 bg-white/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center shadow-sm shadow-primary-500/20 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">Cover Letter</h4>
            <p className="text-[11px] text-gray-400">Submitted by the applicant</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white/40 border border-white/50 hover:bg-white/60 hover:text-primary-600 hover:border-primary-200 transition-colors flex-shrink-0"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white/10">
        <div className={`relative ${showFull ? '' : 'max-h-40 overflow-hidden'}`}>
          <p className="text-sm sm:text-[15px] leading-7 text-gray-700 whitespace-pre-line break-words">
            {trimmed}
          </p>
          {!showFull && (
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
          )}
        </div>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            {expanded ? 'Show less' : 'Read full letter'}
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CoverLetterCard;
