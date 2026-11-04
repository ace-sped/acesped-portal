/**
 * Converts raw API / Prisma / network errors into short user-facing copy.
 * Keeps technical details out of the UI while logging can still use the original.
 */

const TECHNICAL_PATTERNS = [
  /can't reach database/i,
  /could not connect/i,
  /database server/i,
  /prisma/i,
  /__turbopack/i,
  /turbopack/i,
  /invocation in/i,
  /econnrefused/i,
  /enotfound/i,
  /etimedout/i,
  /econnreset/i,
  /socket hang up/i,
  /neon\.tech/i,
  /amazonaws\.com:\d+/i,
  /postgres(?:ql)?:\/\//i,
  /server\s+chunks/i,
  /\.next[/\\]/i,
  /node_modules/i,
  /at\s+\w+\s+\(/i,
];

const NETWORK_PATTERNS = [
  /failed to fetch/i,
  /networkerror/i,
  /network error/i,
  /load failed/i,
  /fetch failed/i,
  /aborted/i,
];

function extractRawMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error.trim();
  if (error instanceof Error) return error.message?.trim() || '';
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message.trim();
    if (typeof obj.error === 'string') return obj.error.trim();
  }
  return String(error).trim();
}

export function isTechnicalErrorMessage(message: string): boolean {
  if (!message) return false;
  if (message.length > 220) return true;
  if (message.includes('\n') && message.length > 100) return true;
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));
}

export function isNetworkErrorMessage(message: string): boolean {
  if (!message) return false;
  return NETWORK_PATTERNS.some((pattern) => pattern.test(message));
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Something went wrong while loading. Please try again.'
): string {
  const raw = extractRawMessage(error);
  if (!raw) return fallback;

  if (isTechnicalErrorMessage(raw) || isNetworkErrorMessage(raw)) {
    if (
      /database|prisma|neon\.tech|postgres|can't reach|could not connect/i.test(raw) ||
      isTechnicalErrorMessage(raw)
    ) {
      return "We couldn't connect to the server right now. Please check your connection and try again.";
    }
    return 'Network error. Please check your internet connection and try again.';
  }

  // Keep short, already-friendly messages (e.g. "Program not found")
  if (raw.length <= 160) return raw;

  return fallback;
}

export function apiErrorPayload(
  error: unknown,
  fallback: string
): { success: false; message: string } {
  // Always log the real error server-side before calling this.
  return {
    success: false,
    message: getFriendlyErrorMessage(error, fallback),
  };
}
