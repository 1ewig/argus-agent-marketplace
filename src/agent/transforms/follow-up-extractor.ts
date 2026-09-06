import { APP_CONTENT } from '@/constants/content';
import { FOLLOW_UP_TAG_REGEX, INCOMPLETE_FOLLOW_UP_TAG_REGEX } from './sanitizer';

export { FOLLOW_UP_TAG_REGEX, INCOMPLETE_FOLLOW_UP_TAG_REGEX };

export interface ExtractedFollowUpsResult {
  followUpQuestions: string[];
  cleanedText: string;
}

/**
 * Returns 3 intelligent fallback follow-up questions for the active symbol or global workspace.
 */
export function getFallbackFollowUpQuestions(symbol?: string): string[] {
  const clean = symbol?.toUpperCase().trim();
  return clean && clean !== 'GLOBAL'
    ? [...APP_CONTENT.chat.fallbackFollowUps(clean)]
    : [...APP_CONTENT.chat.globalFallbackFollowUps];
}

/**
 * Extracts exactly 3 follow-up questions from the agent output and strips <follow_up_questions> markup.
 */
export function extractFollowUpQuestions(rawText: string, symbol?: string): ExtractedFollowUpsResult {
  const match = rawText.match(/<follow_up_questions>([\s\S]*?)<\/follow_up_questions>/i);
  const fallbacks = getFallbackFollowUpQuestions(symbol);

  const parsed = match?.[1]
    ?.split('\n')
    .map((line) => line.replace(/^[\s*\-•\d.)\]>]+/, '').replace(/^["'`]+|["'`]+$/g, '').trim())
    .filter((q) => q.length > 5) || [];

  const questions = Array.from(new Set([...parsed, ...fallbacks])).slice(0, 3);
  const cleanedText = rawText
    .replace(FOLLOW_UP_TAG_REGEX, '')
    .replace(INCOMPLETE_FOLLOW_UP_TAG_REGEX, '')
    .trim();

  return { followUpQuestions: questions, cleanedText };
}

