import assert from "node:assert/strict";
import test from "node:test";

test("loadEntryProfileDraft restores a valid draft from storage", async () => {
  const { ENTRY_PROFILE_DRAFT_KEY, loadEntryProfileDraft } =
    await import("../lib/entry-profile-draft.js");
  const storage = createStorage({
    [ENTRY_PROFILE_DRAFT_KEY]: JSON.stringify({
      codename: "夜航者",
      mood: "minimal",
    }),
  });

  assert.deepEqual(loadEntryProfileDraft(storage), {
    codename: "夜航者",
    mood: "minimal",
  });
});

test("loadEntryProfileDraft falls back to defaults for broken or unknown data", async () => {
  const {
    ENTRY_PROFILE_DRAFT_KEY,
    DEFAULT_ENTRY_PROFILE_DRAFT,
    loadEntryProfileDraft,
  } = await import("../lib/entry-profile-draft.js");

  const brokenStorage = createStorage({
    [ENTRY_PROFILE_DRAFT_KEY]: "{invalid json",
  });
  const unknownMoodStorage = createStorage({
    [ENTRY_PROFILE_DRAFT_KEY]: JSON.stringify({
      codename: "夜航者",
      mood: "unknown",
    }),
  });

  assert.deepEqual(
    loadEntryProfileDraft(brokenStorage),
    DEFAULT_ENTRY_PROFILE_DRAFT,
  );
  assert.deepEqual(loadEntryProfileDraft(unknownMoodStorage), {
    codename: "夜航者",
    mood: DEFAULT_ENTRY_PROFILE_DRAFT.mood,
  });
});

test("saveEntryProfileDraft normalizes the value before writing", async () => {
  const { ENTRY_PROFILE_DRAFT_KEY, saveEntryProfileDraft } =
    await import("../lib/entry-profile-draft.js");
  const storage = createStorage();

  saveEntryProfileDraft(storage, {
    codename: 123,
    mood: "unknown",
  });

  assert.equal(
    storage.getItem(ENTRY_PROFILE_DRAFT_KEY),
    JSON.stringify({
      codename: "",
      mood: "calm",
    }),
  );
});

test("getEntryProfileDraftSnapshot reuses the same object while storage is unchanged", async () => {
  const draftStore = await import("../lib/entry-profile-draft.js");
  const storage = createStorage({
    [draftStore.ENTRY_PROFILE_DRAFT_KEY]: JSON.stringify({
      codename: "夜航者",
      mood: "minimal",
    }),
  });
  const previousWindow = globalThis.window;

  globalThis.window = { localStorage: storage };

  try {
    const firstSnapshot = draftStore.getEntryProfileDraftSnapshot();
    const secondSnapshot = draftStore.getEntryProfileDraftSnapshot();

    assert.equal(secondSnapshot, firstSnapshot);
  } finally {
    globalThis.window = previousWindow;
  }
});

test("hasStoredEntryProfileDraft reports whether a draft is already cached", async () => {
  const { ENTRY_PROFILE_DRAFT_KEY, hasStoredEntryProfileDraft } =
    await import("../lib/entry-profile-draft.js");

  assert.equal(hasStoredEntryProfileDraft(createStorage()), false);
  assert.equal(
    hasStoredEntryProfileDraft(
      createStorage({
        [ENTRY_PROFILE_DRAFT_KEY]: JSON.stringify({
          codename: "夜航者",
          mood: "minimal",
        }),
      }),
    ),
    true,
  );
});

test("shouldAutoResumeEntryProfile only allows auto-resume when a draft or session already existed on page load", async () => {
  const { shouldAutoResumeEntryProfile } =
    await import("../lib/entry-profile-draft.js");

  assert.equal(
    shouldAutoResumeEntryProfile({
      hadStoredDraftOnLoad: false,
      hadStoredSessionOnLoad: false,
      hasAttemptedAutoResume: false,
      hasSession: false,
      isAutoResumeInFlight: false,
    }),
    false,
  );
  assert.equal(
    shouldAutoResumeEntryProfile({
      hadStoredDraftOnLoad: true,
      hadStoredSessionOnLoad: false,
      hasAttemptedAutoResume: false,
      hasSession: false,
      isAutoResumeInFlight: false,
    }),
    true,
  );
  assert.equal(
    shouldAutoResumeEntryProfile({
      hadStoredDraftOnLoad: false,
      hadStoredSessionOnLoad: true,
      hasAttemptedAutoResume: false,
      hasSession: false,
      isAutoResumeInFlight: false,
    }),
    true,
  );
  assert.equal(
    shouldAutoResumeEntryProfile({
      hadStoredDraftOnLoad: true,
      hadStoredSessionOnLoad: true,
      hasAttemptedAutoResume: true,
      hasSession: false,
      isAutoResumeInFlight: false,
    }),
    false,
  );
});

function createStorage(initialState = {}) {
  const state = new Map(Object.entries(initialState));

  return {
    getItem(key) {
      return state.has(key) ? state.get(key) : null;
    },
    setItem(key, value) {
      state.set(key, `${value}`);
    },
  };
}
