export const SESSION_TITLE_TAG_REGEX = /<session_title>[\s\S]*?<\/session_title>\s*/gi;
export const INCOMPLETE_SESSION_TITLE_TAG_REGEX = /<session_title>[\s\S]*$/i;
export const FOLLOW_UP_TAG_REGEX = /<follow_up_questions>[\s\S]*?<\/follow_up_questions>\s*/gi;
export const INCOMPLETE_FOLLOW_UP_TAG_REGEX = /<follow_up_questions[\s\S]*$/gi;

/**
 * Strips complete (and optionally in-flight) XML meta tags from agent text.
 */
export function sanitizeAgentText(
  text: string,
  options: { removeIncomplete?: boolean } = {}
): string {
  if (!text) return '';
  let cleaned = text
    .replace(SESSION_TITLE_TAG_REGEX, '')
    .replace(FOLLOW_UP_TAG_REGEX, '');

  if (options.removeIncomplete) {
    cleaned = cleaned
      .replace(INCOMPLETE_SESSION_TITLE_TAG_REGEX, '')
      .replace(INCOMPLETE_FOLLOW_UP_TAG_REGEX, '');
  }

  return cleaned.trim();
}
