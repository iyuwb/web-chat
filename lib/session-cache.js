export const SESSION_CACHE_KEY = "simple-chat.session-cache";

function normalizeSessionCache(value) {
  const sessionId = `${value?.sessionId ?? ""}`.trim();

  if (!sessionId) {
    return null;
  }

  return { sessionId };
}

export function loadSessionCache(storage) {
  const rawValue = storage?.getItem?.(SESSION_CACHE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeSessionCache(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function saveSessionCache(storage, value) {
  const nextValue = normalizeSessionCache(value);

  if (!nextValue) {
    clearSessionCache(storage);
    return null;
  }

  try {
    storage?.setItem?.(SESSION_CACHE_KEY, JSON.stringify(nextValue));
  } catch {
    // Ignore sessionStorage write failures.
  }

  return nextValue;
}

export function clearSessionCache(storage) {
  try {
    storage?.removeItem?.(SESSION_CACHE_KEY);
  } catch {
    // Ignore sessionStorage removal failures.
  }
}
