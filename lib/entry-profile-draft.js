import { MOOD_OPTIONS } from "./chat-ui-data.js";

export const ENTRY_PROFILE_DRAFT_KEY = "simple-chat.entry-profile-draft";
export const DEFAULT_ENTRY_PROFILE_DRAFT = Object.freeze({
  codename: "",
  mood: "calm",
});

const moodIds = new Set(MOOD_OPTIONS.map((option) => option.id));
const listeners = new Set();
let cachedRawValue = null;
let cachedSnapshot = DEFAULT_ENTRY_PROFILE_DRAFT;

export function normalizeEntryProfileDraft(value) {
  return {
    codename: typeof value?.codename === "string" ? value.codename : "",
    mood: moodIds.has(value?.mood)
      ? value.mood
      : DEFAULT_ENTRY_PROFILE_DRAFT.mood,
  };
}

export function loadEntryProfileDraft(storage) {
  const rawValue = storage?.getItem?.(ENTRY_PROFILE_DRAFT_KEY);

  if (!rawValue) {
    return DEFAULT_ENTRY_PROFILE_DRAFT;
  }

  try {
    return normalizeEntryProfileDraft(JSON.parse(rawValue));
  } catch {
    return DEFAULT_ENTRY_PROFILE_DRAFT;
  }
}

function cacheEntryProfileDraft(rawValue, snapshot) {
  cachedRawValue = rawValue;
  cachedSnapshot = snapshot;
  return snapshot;
}

function getCachedEntryProfileDraft(rawValue) {
  if (rawValue === cachedRawValue) {
    return cachedSnapshot;
  }

  if (!rawValue) {
    return cacheEntryProfileDraft(null, DEFAULT_ENTRY_PROFILE_DRAFT);
  }

  try {
    return cacheEntryProfileDraft(
      rawValue,
      normalizeEntryProfileDraft(JSON.parse(rawValue)),
    );
  } catch {
    return cacheEntryProfileDraft(rawValue, DEFAULT_ENTRY_PROFILE_DRAFT);
  }
}

export function saveEntryProfileDraft(storage, value) {
  const nextDraft = normalizeEntryProfileDraft(value);
  const rawValue = JSON.stringify(nextDraft);

  try {
    storage?.setItem?.(ENTRY_PROFILE_DRAFT_KEY, rawValue);
  } catch {
    // Ignore localStorage write failures in private mode or quota errors.
  }

  return cacheEntryProfileDraft(rawValue, nextDraft);
}

export function hasStoredEntryProfileDraft(storage) {
  return Boolean(storage?.getItem?.(ENTRY_PROFILE_DRAFT_KEY));
}

export function shouldAutoResumeEntryProfile({
  hadStoredDraftOnLoad,
  hadStoredSessionOnLoad,
  hasAttemptedAutoResume,
  hasSession,
  isAutoResumeInFlight,
}) {
  return (
    (hadStoredDraftOnLoad || hadStoredSessionOnLoad) &&
    !hasAttemptedAutoResume &&
    !hasSession &&
    !isAutoResumeInFlight
  );
}

export function subscribeEntryProfileDraft(callback) {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

export function getEntryProfileDraftSnapshot() {
  if (typeof window === "undefined") {
    return DEFAULT_ENTRY_PROFILE_DRAFT;
  }

  return getCachedEntryProfileDraft(
    window.localStorage?.getItem?.(ENTRY_PROFILE_DRAFT_KEY) ?? null,
  );
}

export function getEntryProfileDraftServerSnapshot() {
  return DEFAULT_ENTRY_PROFILE_DRAFT;
}

export function updateEntryProfileDraft(value) {
  if (typeof window === "undefined") {
    return normalizeEntryProfileDraft(value);
  }

  const nextDraft = saveEntryProfileDraft(window.localStorage, value);

  listeners.forEach((listener) => {
    listener();
  });

  return nextDraft;
}
