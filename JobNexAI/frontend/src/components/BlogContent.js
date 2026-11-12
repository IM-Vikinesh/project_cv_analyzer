import React from 'react';
import ReactMarkdown from 'react-markdown';
import { stripHtml, getBlogExcerpt, getReadingMinutes } from './blogUtils';

const HTML_TAG = /<\/?[a-z][\s\S]*>/i;

export { stripHtml, getBlogExcerpt, getReadingMinutes };

const BlogContent = ({ content, className = '' }) => {
  const raw = (content || '').replace(/\r\n?/g, '\n').trim();
  if (!raw) return null;

  const proseClasses = `blog-prose prose prose-lg max-w-none text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-primary-400 prose-blockquote:bg-primary-50/50 prose-blockquote:py-1 prose-blockquote:not-italic prose-li:marker:text-primary-500 ${className}`;

  if (HTML_TAG.test(raw)) {
    return <div className={proseClasses} dangerouslySetInnerHTML={{ __html: raw }} />;
  }

  return (
    <div className={proseClasses}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="whitespace-pre-line leading-relaxed">{children}</p>
          ),
        }}
      >
        {raw}
      </ReactMarkdown>
    </div>
  );
};

export default BlogContent;
