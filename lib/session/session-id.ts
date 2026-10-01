export const LEGACY_SESSION_ID = 'session_default_user';
const SESSION_ID_STORAGE_KEY = 'hello_ai_session_id';
const LEGACY_SESSION_STORAGE_KEY = `hello_ai_session_${LEGACY_SESSION_ID}`;
const MAX_LEGACY_SESSION_BYTES = 128_000;

const SESSION_ID_PATTERN = /^session_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSessionId(value: unknown): value is string {
  return typeof value === 'string' && SESSION_ID_PATTERN.test(value);
}

interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function resolveBrowserSessionId(
  storage: SessionStorageLike,
  createUuid: () => string
): string {
  const existingId = storage.getItem(SESSION_ID_STORAGE_KEY);
  if (isSessionId(existingId)) return existingId;

  const sessionId = `session_${createUuid()}`;
  const legacyValue = storage.getItem(LEGACY_SESSION_STORAGE_KEY);
  if (legacyValue && legacyValue.length <= MAX_LEGACY_SESSION_BYTES) {
    try {
      const parsed: unknown = JSON.parse(legacyValue);
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        'sessionId' in parsed &&
        parsed.sessionId === LEGACY_SESSION_ID
      ) {
        storage.setItem(
          `hello_ai_session_${sessionId}`,
          JSON.stringify({ ...parsed, sessionId })
        );
      }
    } catch {
      // A corrupt legacy entry must not prevent creation of a fresh isolated session.
    }
  }

  storage.removeItem(LEGACY_SESSION_STORAGE_KEY);
  storage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
  return sessionId;
}

let inMemoryFallbackSessionId: string | null = null;

function createBrowserUuid(): string {
  if (typeof window === 'undefined' || !window.crypto) {
    throw new Error('Secure browser randomness is unavailable');
  }
  if (typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getOrCreateBrowserSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return resolveBrowserSessionId(window.localStorage, createBrowserUuid);
  } catch {
    // Keep the same session for this page lifetime when storage is unavailable.
    inMemoryFallbackSessionId ??= `session_${createBrowserUuid()}`;
    return inMemoryFallbackSessionId;
  }
}
