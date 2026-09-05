import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { ToolCardProps } from '../types';

export function CryptoNewsCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const articles = Array.isArray(resultObj?.articles)
    ? (resultObj.articles as Array<{
        id?: string;
        title?: string;
        url?: string;
        publishedDate?: string;
        author?: string;
        highlights?: string[];
        text?: string;
      }>)
    : [];

  const totalResults = typeof resultObj?.totalResults === 'number' ? resultObj.totalResults : articles.length;
  const query = typeof resultObj?.query === 'string' ? resultObj.query : undefined;

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      {/* Header / Query summary */}
      <div className="flex items-center justify-between pb-1.5 border-b border-theme-border-subtle/50 text-[10px]">
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="size-3 text-theme-brand-binance shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-theme-text-muted truncate">
            {res.newsResults}
          </span>
          {query && (
            <span className="text-theme-text-muted truncate max-w-[180px]">
              &quot;{query}&quot;
            </span>
          )}
        </div>
        <span className="text-theme-text-muted font-mono shrink-0">
          {totalResults} {res.newsArticlesFound}
        </span>
      </div>

      {/* Articles List */}
      {articles.length > 0 ? (
        <div className="flex flex-col gap-2 pt-0.5">
          {articles.map((article, idx) => {
            let hostname = '';
            try {
              if (article.url) {
                hostname = new URL(article.url).hostname.replace(/^www\./, '');
              }
            } catch {
              hostname = '';
            }

            const snippet = article.highlights?.[0] || article.text || '';
            const cleanSnippet = snippet.length > 140 ? `${snippet.slice(0, 140)}...` : snippet;

            let formattedDate = '';
            if (article.publishedDate) {
              try {
                formattedDate = new Date(article.publishedDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
              } catch {
                formattedDate = '';
              }
            }

            return (
              <div
                key={article.id ?? `news_${idx}`}
                className="flex flex-col gap-1 p-2 rounded-lg bg-theme-bg-surface/60 hover:bg-theme-bg-surface border border-theme-border-subtle/60 hover:border-theme-border-strong transition-colors group"
              >
                {/* Meta header: Domain & Date */}
                <div className="flex items-center justify-between text-[10px] text-theme-text-muted">
                  {hostname && (
                    <span className="px-1.5 py-0.2 rounded bg-theme-bg-elevated text-theme-text-secondary font-mono font-medium">
                      {hostname}
                    </span>
                  )}
                  {formattedDate && <span className="font-mono">{formattedDate}</span>}
                </div>

                {/* Article Title with Link */}
                <a
                  href={article.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors leading-snug flex items-start justify-between gap-1.5"
                >
                  <span className="line-clamp-2">{article.title || 'Untitled'}</span>
                  <ExternalLink className="size-3 text-theme-text-muted group-hover:text-theme-brand-binance shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* Snippet / Highlight */}
                {cleanSnippet && (
                  <p className="text-[11px] text-theme-text-secondary leading-relaxed line-clamp-2 mt-0.5">
                    {cleanSnippet}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <span className="text-theme-text-muted text-xs italic py-1">
          {typeof resultObj?.warning === 'string' ? resultObj.warning : res.emptyResult}
        </span>
      )}
    </div>
  );
}
