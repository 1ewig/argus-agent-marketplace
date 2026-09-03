'use client';

import React, { useState, createContext, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ExternalLink } from 'lucide-react';

const InsidePreContext = createContext<boolean>(false);

interface CodeBlockProps {
  language?: string;
  code: string;
  children: React.ReactNode;
}

function CodeBlock({ language, code, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="relative my-2.5 rounded-lg border border-theme-border-subtle bg-theme-bg-elevated/40 overflow-hidden font-mono text-2xs group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-theme-bg-elevated/80 border-b border-theme-border-subtle text-theme-text-muted select-none">
        <span className="font-semibold text-2xs uppercase tracking-wider text-theme-text-secondary/80">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1 text-2xs text-theme-text-muted hover:text-theme-text-primary py-0.5 px-1.5 rounded transition-colors cursor-pointer hover:bg-theme-bg-elevated"
        >
          {copied ? (
            <>
              <Check className="size-3 text-theme-status-success" />
              <span className="text-theme-status-success font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3 overflow-x-auto font-mono text-2xs leading-relaxed text-theme-text-primary whitespace-pre m-0">
        {children}
      </pre>
    </div>
  );
}

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
            <h1 className="text-sm font-bold text-theme-text-primary mt-4 mb-2 first:mt-0 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-theme-text-primary mt-3.5 mb-1.5 first:mt-0 border-b border-theme-border-subtle/70 pb-1 tracking-tight uppercase">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-theme-text-primary mt-3 mb-1 first:mt-0 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-theme-text-secondary mt-2 mb-1 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs text-theme-text-primary leading-relaxed mb-2.5 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-theme-text-primary">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-theme-text-secondary">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through text-theme-text-muted opacity-80">
              {children}
            </del>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 my-2 space-y-1 text-xs text-theme-text-secondary marker:text-theme-text-muted">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 my-2 space-y-1 text-xs text-theme-text-secondary marker:text-theme-text-muted">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">
              {children}
            </li>
          ),
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="size-3 rounded border-theme-border-subtle text-theme-brand-binance accent-theme-brand-binance mr-1.5 align-middle pointer-events-none"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-theme-brand-binance bg-theme-bg-elevated/30 rounded-r px-3 py-1.5 my-2.5 italic text-theme-text-secondary text-xs">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-3.5 border-t border-theme-border-subtle" />
          ),
          pre: ({ children }) => {
            let codeString = '';
            let language = '';

            if (React.isValidElement(children)) {
              const codeProps = children.props as { className?: string; children?: React.ReactNode };
              language = (codeProps?.className || '').replace(/language-/, '').trim();
              const raw = codeProps?.children;
              if (typeof raw === 'string') {
                codeString = raw;
              } else if (Array.isArray(raw)) {
                codeString = raw.map((item) => (typeof item === 'string' ? item : '')).join('');
              }
            }

            return (
              <InsidePreContext.Provider value={true}>
                <CodeBlock language={language} code={codeString.replace(/\n$/, '')}>
                  {children}
                </CodeBlock>
              </InsidePreContext.Provider>
            );
          },
          code: ({ className, children, ...props }) => {
            const isInsidePre = useContext(InsidePreContext);

            if (isInsidePre) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <code
                className="bg-theme-bg-elevated text-theme-brand-binance px-1.5 py-0.5 rounded font-mono text-2xs border border-theme-border-subtle/80 font-medium select-all"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-theme-border-subtle shadow-xs">
              <table className="w-full border-collapse text-2xs font-mono text-left">
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
            <tbody className="divide-y divide-theme-border-subtle/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-theme-bg-elevated/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="py-2 px-3 text-left font-semibold text-theme-text-primary text-2xs tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3 text-theme-text-secondary align-top leading-normal">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-0.5 text-theme-brand-binance hover:underline underline-offset-2 font-medium transition-colors group cursor-pointer"
            >
              <span>{children}</span>
              <ExternalLink className="size-2.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity translate-y-px" />
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}