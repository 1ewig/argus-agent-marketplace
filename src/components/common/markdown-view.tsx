'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
}

export function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <div className="w-full text-xs text-theme-text-primary leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm font-bold text-theme-text-primary mt-spacing-sm mb-spacing-xs tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-theme-text-primary mt-spacing-sm mb-spacing-xs border-b border-theme-border-subtle pb-0.5 tracking-tight uppercase">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-theme-text-primary mt-spacing-xs mb-spacing-xs">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-xs text-theme-text-primary leading-relaxed mb-spacing-xs last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-theme-text-primary">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-spacing-md mb-spacing-xs space-y-1 text-xs text-theme-text-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-spacing-md mb-spacing-xs space-y-1 text-xs text-theme-text-secondary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-theme-brand-binance pl-spacing-sm my-spacing-xs italic text-theme-text-secondary text-xs">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === 'string';
            if (isInline) {
              return (
                <code className="bg-theme-bg-elevated text-theme-brand-binance px-1 py-0.5 rounded font-mono text-2xs border border-theme-border-subtle" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-theme-bg-elevated p-spacing-sm rounded font-mono text-2xs overflow-x-auto border border-theme-border-subtle my-spacing-xs text-theme-text-primary">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-spacing-xs rounded border border-theme-border-subtle">
              <table className="w-full border-collapse text-2xs font-mono">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-theme-bg-elevated text-theme-text-primary border-b border-theme-border-subtle">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-theme-border-subtle">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-theme-bg-elevated/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="p-spacing-xs px-spacing-sm text-left font-bold border-r border-theme-border-subtle last:border-r-0 text-theme-text-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-spacing-xs px-spacing-sm border-r border-theme-border-subtle last:border-r-0 text-theme-text-secondary">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-brand-binance hover:underline font-medium"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
