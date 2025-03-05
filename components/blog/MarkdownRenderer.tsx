"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const customComponents: Partial<Components> = {
    // div要素として直接スタイルを適用
    div: ({ children }) => (
      <div className="prose prose-stone dark:prose-invert max-w-none">
        {children}
      </div>
    ),
    
    // リンクのカスタマイズ
    a: ({ href, children }) => {
      const isExternal = href?.startsWith('http');
      return (
        <a 
          href={href} 
          className="text-blue-600 hover:underline" 
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    },
    
    // コードブロックのカスタマイズ
    code: ({ inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
            {children}
          </code>
        );
      }
      
      return (
        <div className="bg-gray-50 rounded-md overflow-hidden">
          <pre className="p-4 overflow-x-auto">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="markdown-content prose dark:prose-invert max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 