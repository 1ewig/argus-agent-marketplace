'use client';

import { useRef, useEffect, useCallback } from 'react';

export interface UseChatScrollOptions {
  activeConversationId: string;
  messagesCount: number;
  streamStepCount: number;
  streamContentLength: number;
  isLoading: boolean;
}

/**
 * Custom hook managing message list scrolling, auto-scroll detection,
 * and requestAnimationFrame (RAF) throttling to prevent layout thrashing during high-speed SSE streaming.
 */
export function useChatScroll({
  activeConversationId,
  messagesCount,
  streamStepCount,
  streamContentLength,
  isLoading,
}: UseChatScrollOptions) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabledRef = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);
  const isScrollPendingRef = useRef<boolean>(false);

  // RAF-throttled scroll listener detecting if user manually scrolled up without layout thrashing
  const handleScroll = useCallback(() => {
    if (isScrollPendingRef.current) return;
    isScrollPendingRef.current = true;

    requestAnimationFrame(() => {
      isScrollPendingRef.current = false;
      const container = scrollContainerRef.current;
      if (!container) return;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      // Keep auto-scroll active if within 80px of bottom; lock if scrolled up
      isAutoScrollEnabledRef.current = distanceFromBottom <= 80;
    });
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    isAutoScrollEnabledRef.current = true;
    const container = scrollContainerRef.current;
    if (container) {
      if (smooth && container.scrollHeight > container.clientHeight) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }
  }, []);

  // Instant scroll to bottom when switching conversations
  useEffect(() => {
    isAutoScrollEnabledRef.current = true;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [activeConversationId]);

  // Instant scroll on message count changes if auto-scroll is active
  useEffect(() => {
    if (!isAutoScrollEnabledRef.current) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messagesCount]);

  // RAF-throttled scroll during active streaming — eliminates forced smooth reflow thrashing
  useEffect(() => {
    if (!isAutoScrollEnabledRef.current) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!isAutoScrollEnabledRef.current) return;

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [streamStepCount, streamContentLength, isLoading]);

  return {
    messagesEndRef,
    scrollContainerRef,
    isAutoScrollEnabledRef,
    handleScroll,
    scrollToBottom,
  };
}
