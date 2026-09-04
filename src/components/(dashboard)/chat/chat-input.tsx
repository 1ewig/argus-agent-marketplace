'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export interface ChatInputProps {
  isLoading: boolean;
  onSend: (text: string) => void | Promise<void>;
  placeholder?: string;
}

/**
 * Isolated ChatInput component decoupling keystroke state from the main chat viewport.
 * Prevents full ChatWindow re-renders on every keystroke and eliminates synchronous layout thrashing.
 */
export const ChatInput = React.memo(function ChatInput({
  isLoading,
  onSend,
  placeholder = APP_CONTENT.chat.inputPlaceholder,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Smooth, non-blocking auto-resize via requestAnimationFrame
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const target = e.target;
    requestAnimationFrame(() => {
      target.style.height = 'auto';
      target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
    });
  };

  const handleResetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setText('');
    handleResetHeight();
    void onSend(trimmed);
  }, [text, isLoading, onSend, handleResetHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-spacing-md bg-theme-bg-surface border-t border-theme-border-subtle shrink-0">
      <div className="flex items-end gap-spacing-xs bg-theme-bg-elevated/60 hover:bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-spacing-xs focus-within:bg-theme-bg-surface focus-within:border-theme-border-strong focus-within:ring-1 focus-within:ring-theme-border-strong transition-all shadow-2xs">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-transparent text-xs text-theme-text-primary placeholder:text-theme-text-muted focus:outline-hidden p-spacing-xs leading-relaxed max-h-32"
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          aria-label={APP_CONTENT.chat.sendButton}
          className="flex items-center justify-center size-8 rounded-lg bg-theme-bg-overlay text-theme-brand-binance hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs shrink-0"
        >
          <Send className="size-3.5" />
        </motion.button>
      </div>
    </div>
  );
});
