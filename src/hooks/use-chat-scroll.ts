'use client';

import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';

// Safe SSR-compatible layout effect executing before browser paint on client
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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

  // Synchronously lock scroll position to bottom before paint when switching conversations or loading messages
  useIsomorphicLayoutEffect(() => {
    isAutoScrollEnabledRef.current = true;
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [activeConversationId, messagesCount]);

  // Guaranteed bottom pinning across layout reflows and dynamic message rendering
  useEffect(() => {
    if (!isAutoScrollEnabledRef.current) return;

    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });

    let rafId2: number | null = null;
    const rafId1 = requestAnimationFrame(() => {
      if (scrollContainerRef.current && isAutoScrollEnabledRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
      rafId2 = requestAnimationFrame(() => {
        if (scrollContainerRef.current && isAutoScrollEnabledRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    });

    return () => {
      cancelAnimationFrame(rafId1);
      if (rafId2 !== null) cancelAnimationFrame(rafId2);
    };
  }, [activeConversationId, messagesCount]);

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
