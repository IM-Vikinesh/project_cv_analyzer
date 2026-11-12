import React from 'react';

export const ErrorState = ({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again' }) => (
  <div className="bento-card-glass p-8 sm:p-12 text-center" role="alert">
    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
      <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {message && <p className="text-gray-500 mt-2 max-w-md mx-auto">{message}</p>}
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-primary mt-6 inline-flex items-center justify-center">
        {retryLabel}
      </button>
    )}
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', message, action, icon }) => (
  <div className="bento-card-glass p-8 sm:p-12 text-center">
    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500">
      {icon || (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.172 16.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {message && <p className="text-gray-500 mt-2 max-w-md mx-auto">{message}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const InlineError = ({ message, onRetry }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700" role="alert">
    <span>{message}</span>
    {onRetry && (
      <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2 hover:text-red-800 self-start sm:self-auto">
        Retry
      </button>
    )}
  </div>
);
