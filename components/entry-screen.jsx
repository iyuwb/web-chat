"use client";

import { ArrowRight, CircleHelp, Globe, MessageCircleMore } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MoodGlyph } from "./app-chrome.jsx";
import { MOOD_OPTIONS, PLACEHOLDER_ACTIONS } from "./prototype-data.js";
import { useChat } from "./chat-provider.jsx";
import { cx } from "../lib/cx.js";

export function EntryScreen() {
  const router = useRouter();
  const { activeChat, createSession, hasSession, showToast } = useChat();
  const [codename, setCodename] = useState("");
  const [mood, setMood] = useState("calm");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    startTransition(() => {
      router.replace(activeChat ? "/chat" : "/discover");
    });
  }, [activeChat, hasSession, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createSession({
        codename: codename.trim() || "匿名访客",
        mood
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-[8%] bottom-[-15%] h-[34rem] w-[34rem] rounded-full bg-primary-container/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-[8%] top-[-12%] h-[38rem] w-[38rem] rounded-full bg-tertiary-container/30 blur-[140px]" />

      <header className="relative z-10 hidden items-center justify-between px-12 py-8 lg:flex">
        <div className="font-headline text-xl font-bold uppercase tracking-[0.28em] text-on-surface">
          Ethereal Whisper
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => showToast(PLACEHOLDER_ACTIONS.language)}
          >
            <Globe className="h-5 w-5 text-on-surface-variant transition-colors hover:text-on-surface" />
          </button>
          <button type="button" onClick={() => showToast(PLACEHOLDER_ACTIONS.help)}>
            <CircleHelp className="h-5 w-5 text-on-surface-variant transition-colors hover:text-on-surface" />
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-surface-container-lowest p-3 shadow-sm lg:hidden">
            <MessageCircleMore className="h-8 w-8 text-primary" strokeWidth={1.8} />
          </div>

          <div className="space-y-6">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface lg:text-6xl">
              开启匿名私语
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-on-surface-variant lg:text-xl">
              在静默的临时空间里，以全新的代号与陌生人建立一段不会被保存的对话。
            </p>
          </div>

          <form className="mt-14 w-full space-y-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                设置你的代号
              </label>
              <div className="group rounded-full bg-surface-container-highest/80 px-4 py-1 shadow-[0_10px_30px_-10px_rgba(42,52,55,0.05)] transition-all focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_1px_rgba(72,98,110,0.08),0_10px_30px_-10px_rgba(42,52,55,0.08)]">
                <input
                  className="w-full rounded-full border-none bg-transparent px-6 py-5 text-center font-headline text-xl text-on-surface placeholder:text-outline focus:ring-0"
                  maxLength={24}
                  placeholder="灵魂的称谓..."
                  type="text"
                  value={codename}
                  onChange={(event) => setCodename(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="block font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                选择当前心境
              </label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {MOOD_OPTIONS.map((option) => {
                  const selected = option.id === mood;

                  return (
                    <button
                      key={option.id}
                      className="group flex flex-col items-center gap-3"
                      type="button"
                      onClick={() => setMood(option.id)}
                    >
                      <div
                        className={cx(
                          "flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant/10 transition-all duration-300",
                          selected
                            ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                            : "bg-surface-container-lowest text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container"
                        )}
                      >
                        <MoodGlyph className="h-6 w-6" name={option.icon} />
                      </div>
                      <span
                        className={cx(
                          "font-label text-xs font-semibold",
                          selected ? "text-on-surface" : "text-on-secondary-fixed-variant"
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4">
              <button
                className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-on-surface px-10 py-5 font-headline text-lg font-bold text-surface shadow-xl shadow-on-surface/5 transition-all duration-300 hover:scale-[1.01] active:scale-95"
                disabled={isSubmitting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-dim/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">
                  {isSubmitting ? "正在建立匿名身份..." : "进入对话"}
                </span>
                <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>

          <p className="mt-16 font-label text-[10px] uppercase tracking-[0.3em] text-outline/70">
            Zero Storage · Zero Logs · Anonymous Relay Only
          </p>
        </div>
      </div>
    </main>
  );
}
