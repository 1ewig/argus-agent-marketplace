import { APP_CONTENT } from '@/constants/content';

/**
 * Regex identifying complete or closing <follow_up_questions> blocks
 */
export const FOLLOW_UP_TAG_REGEX = /<follow_up_questions>[\s\S]*?<\/follow_up_questions>\s*/gi;

/**
 * Regex identifying in-flight / partial <follow_up_questions> opening tags during streaming
 */
export const INCOMPLETE_FOLLOW_UP_TAG_REGEX = /<follow_up_questions[\s\S]*$/gi;

export interface ExtractedFollowUpsResult {
  followUpQuestions: string[];
  cleanedText: string;
}

/**
 * Generates 3 intelligent fallback follow-up questions based on the active symbol or global workspace.
 */
export function getFallbackFollowUpQuestions(symbol?: string): string[] {
  const clean = symbol?.toUpperCase().trim();
  if (clean && clean !== 'GLOBAL') {
    return [...APP_CONTENT.chat.fallbackFollowUps(clean)];
  }
  return [...APP_CONTENT.chat.globalFallbackFollowUps];
}

/**
 * Extracts and cleans exactly 3 follow-up questions from the agent output.
 * Strips the <follow_up_questions> block from the response text so raw XML never renders in UI markdown.
 * Supplements with symbol-aware fallbacks if fewer than 3 questions were generated.
 */
export function extractFollowUpQuestions(rawText: string, symbol?: string): ExtractedFollowUpsResult {
  const match = rawText.match(/<follow_up_questions>([\s\S]*?)<\/follow_up_questions>/i);
  const fallbacks = getFallbackFollowUpQuestions(symbol);

  const parsedQuestions: string[] = [];

  if (match && match[1]) {
    const rawBlock = match[1];
    const lines = rawBlock.split('\n');

    for (const line of lines) {
      // Strip leading bullet markers, numbering (e.g. "1.", "1)", "- ", "* "), and trailing/leading quotes
      const cleaned = line
        .replace(/^[\s*\-•\d.)\]>]+/, '')
        .replace(/^["'`]+|["'`]+$/g, '')
        .trim();

      if (cleaned.length > 5 && !parsedQuestions.includes(cleaned)) {
        parsedQuestions.push(cleaned);
      }

      if (parsedQuestions.length === 3) break;
    }
  }

  // Ensure exactly 3 questions are returned by filling missing slots with contextual fallbacks
  for (const fallback of fallbacks) {
    if (parsedQuestions.length >= 3) break;
    if (!parsedQuestions.includes(fallback)) {
      parsedQuestions.push(fallback);
    }
  }

  // Remove the <follow_up_questions> block and any dangling open tags
  const cleanedText = rawText
    .replace(FOLLOW_UP_TAG_REGEX, '')
    .replace(INCOMPLETE_FOLLOW_UP_TAG_REGEX, '')
    .trim();

  return {
    followUpQuestions: parsedQuestions.slice(0, 3),
    cleanedText,
  };
}
