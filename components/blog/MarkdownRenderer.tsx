"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// react-markdown互換の型定義を使用
interface MarkdownRendererProps {
  content: string;
}

// 自前でコンポーネントのprops型を定義
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  href?: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const customComponents = {
    // div要素として直接スタイルを適用
    div: ({ children }: ComponentProps) => (
      <div className="prose prose-stone dark:prose-invert max-w-none">
        {children}
      </div>
    ),
    
    // リンクのカスタマイズ
    a: ({ href, children }: ComponentProps) => {
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
    code: ({ className, children, ...props }: ComponentProps) => {
      // インラインコードかどうかをクラス名で判断
      const isInline = !className;
      
      if (isInline) {
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