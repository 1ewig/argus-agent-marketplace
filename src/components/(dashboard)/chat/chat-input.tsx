'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  memo,
  useLayoutEffect,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScaleIcon } from '@/constants/animation';

export interface ChatInputHandle {
  setInputText: (text: string) => void;
  getText: () => string;
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export interface ChatInputProps {
  isLoading: boolean;
  onSend: (text: string) => void | Promise<void>;
  onStop?: () => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  maxHeight?: number; // default 160px (~6-7 lines)
}

/**
 * Robust, top-tier expanding single-row chat input area.
 * Expands upward cleanly, supports keyboard shortcuts, IME safety, and animated states.
 */
export const ChatInput = memo(
  forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput(
    {
      isLoading,
      onSend,
      onStop,
      placeholder = APP_CONTENT.chat.inputPlaceholder,
      className,
      containerClassName,
      autoFocus = false,
      disabled = false,
      maxHeight = 160,
    },
    ref
  ) {
    const [text, setText] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize logic with zero-jank measurement
    const resizeTextarea = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;

      // Reset to calculate natural scrollHeight
      el.style.height = 'auto';

      const scrollHeight = el.scrollHeight;
      const targetHeight = Math.min(scrollHeight, maxHeight);

      el.style.height = `${targetHeight}px`;
      // Only show scrollbars once the max height ceiling is exceeded
      el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [maxHeight]);

    useLayoutEffect(() => {
      resizeTextarea();
    }, [text, resizeTextarea]);

    // Handle window resize (e.g., responsive orientation switch)
    useEffect(() => {
      const handleResize = () => resizeTextarea();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [resizeTextarea]);

    // Imperative handle for parent orchestration
    useImperativeHandle(
      ref,
      () => ({
        setInputText: (newText: string) => {
          setText(newText);
          const target = textareaRef.current;
          if (target) {
            target.value = newText;
            requestAnimationFrame(() => {
              resizeTextarea();
              target.focus();
              target.setSelectionRange(newText.length, newText.length);
            });
          }
        },
        getText: () => text,
        focus: () => textareaRef.current?.focus(),
        blur: () => textareaRef.current?.blur(),
        clear: () => {
          setText('');
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        },
      }),
      [text, resizeTextarea]
    );

    const handleSubmit = useCallback(() => {
      const trimmed = text.trim();
      if (!trimmed || isLoading || disabled) return;

      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      void onSend(trimmed);
    }, [text, isLoading, disabled, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Allow newline with Shift+Enter, submit on pure Enter (unless composing via IME)
      if (e.key === 'Enter' && !e.shiftKey && !isComposing && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const handlePaste = () => {
      // Give React microtask queue a tick to digest pasted payload before recalculating
      requestAnimationFrame(resizeTextarea);
    };

    const isButtonDisabled = (!text.trim() && !isLoading) || disabled;

    return (
      <div className={containerClassName ?? 'p-spacing-md pt-0 bg-theme-bg-base shrink-0'}>
        <div
          className={`${className ?? 'max-w-3xl'} mx-auto w-full relative flex items-center gap-2 bg-theme-bg-surface/90 hover:bg-theme-bg-surface border border-theme-border-subtle hover:border-theme-border-strong focus-within:border-theme-border-strong rounded-3xl sm:rounded-full pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-theme-brand-binance/20 shadow-xs transition-all backdrop-blur-xl`}
        >
          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={text}
            rows={1}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            className="flex-1 resize-none bg-transparent text-sm leading-6 text-theme-text-primary placeholder:text-theme-text-muted focus:outline-hidden py-1.5 custom-scrollbar min-h-[38px]"
            style={{ maxHeight: `${maxHeight}px` }}
          />

          {/* Action Button (Send / Stop) */}
          <motion.button
            type="button"
            whileHover={!isButtonDisabled ? { scale: 1.06 } : undefined}
            whileTap={!isButtonDisabled ? tapScaleIcon : undefined}
            onClick={isLoading ? onStop : handleSubmit}
            disabled={isButtonDisabled}
            aria-label={
              isLoading
                ? APP_CONTENT.chat.stopButton
                : APP_CONTENT.chat.sendButton
            }
            className={`flex items-center justify-center size-8 rounded-full transition-all shadow-xs select-none ${
              isLoading
                ? 'bg-theme-text-primary text-theme-bg-base hover:opacity-90 active:scale-95 cursor-pointer'
                : isButtonDisabled
                  ? 'bg-theme-bg-elevated text-theme-text-muted opacity-40 cursor-not-allowed'
                  : 'bg-theme-brand-binance text-theme-bg-overlay hover:brightness-105 active:brightness-95 cursor-pointer'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.div
                  key="stop"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <Square className="size-3 fill-current" />
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Send className="size-3.5 translate-x-px" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    );
  })
);