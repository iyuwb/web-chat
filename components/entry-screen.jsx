"use client";

import { Sparkles } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MoodGlyph } from "./app-chrome.jsx";
import { MOOD_OPTIONS } from "./prototype-data.js";
import { useChat } from "./chat-provider.jsx";
import { cx } from "../lib/cx.js";

function MoodChip({ label, name, selected, onClick }) {
  return (
    <button
      className="group flex flex-col items-center gap-2"
      type="button"
      onClick={onClick}
    >
      <div
        className={cx(
          "flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/10 transition-all duration-300 lg:h-12 lg:w-12",
          selected
            ? "bg-primary text-on-primary shadow-md shadow-primary/10"
            : "bg-surface-container-lowest text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container"
        )}
      >
        <MoodGlyph className="h-4 w-4 lg:h-5 lg:w-5" name={name} />
      </div>
      <span
        className={cx(
          "font-label text-[11px] font-semibold",
          selected ? "text-on-surface" : "text-on-secondary-fixed-variant"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function DesktopMoodPill({ label, selected, onClick }) {
  return (
    <button
      className={cx(
        "rounded-full border px-6 py-2.5 text-sm font-label font-medium leading-none transition-[background-color,border-color,color,box-shadow] duration-300",
        selected
          ? "border-primary-container/70 bg-primary-container text-on-primary-container shadow-sm"
          : "border-outline-variant/30 text-on-surface-variant hover:border-surface-container-high hover:bg-surface-container-high"
      )}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function EntryScreen() {
  const router = useRouter();
  const { activeChat, createSession, hasSession } = useChat();
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

    if (isSubmitting) {
      return;
    }

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
    <main className="relative min-h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(203,231,245,0.42),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(209,228,254,0.42),transparent_40%)]" />
      <div className="pointer-events-none absolute -bottom-[10%] -left-[5%] hidden h-[40rem] w-[40rem] rounded-full bg-primary-container/20 blur-[120px] lg:block" />
      <div className="pointer-events-none absolute -right-[5%] -top-[10%] hidden h-[40rem] w-[40rem] rounded-full bg-tertiary-container/20 blur-[120px] lg:block" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(rgba(72,98,110,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />

      <header className="fixed top-0 z-50 hidden w-full items-center bg-transparent px-12 py-8 lg:flex">
        <div className="font-headline text-base font-bold tracking-[0.12em] text-on-surface xl:text-lg">
          ETHEREAL WHISPER
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-6 py-16 lg:px-8">
        <div className="flex w-full max-w-xl flex-col items-center px-0 py-4 text-center lg:px-8 lg:py-20">
          <div className="mb-10 space-y-4 lg:mb-16 lg:space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/70 bg-white/56 px-4 py-1.5 font-label text-[10px] uppercase tracking-[0.28em] text-primary/75 shadow-[0_14px_32px_-24px_rgba(60,86,98,0.5)] backdrop-blur lg:hidden">
              Zero Storage
            </span>
            <h1 className="font-headline text-[1.55rem] font-semibold tracking-[0.18em] text-on-surface sm:text-[1.72rem] lg:hidden">
              <span className="bg-[linear-gradient(135deg,#3f5965_0%,#5a7380_48%,#6d8491_100%)] bg-clip-text text-transparent">
                开启虚幻对话
              </span>
            </h1>
            <h1 className="hidden font-headline text-5xl font-extrabold tracking-tight text-on-surface lg:block">
              开启虚幻对话
            </h1>
            <p className="mx-auto max-w-md text-sm leading-7 text-on-surface-variant lg:max-w-xl lg:text-lg lg:font-light lg:leading-relaxed lg:tracking-wide">
              在这里，每个灵魂都是一个独特的频率。
            </p>
          </div>

          <form className="w-full space-y-8 lg:space-y-12" onSubmit={handleSubmit}>
            <div className="space-y-3 transition-all duration-500 lg:space-y-0">
              <label className="mb-3 block font-label text-[11px] uppercase tracking-[0.2em] text-on-surface-variant lg:mb-4 lg:text-xs">
                设置你的代号
              </label>
              <input
                className="w-full rounded-full border-none bg-surface-container-highest/55 px-6 py-3.5 text-center font-headline text-base text-on-surface shadow-[0_12px_32px_-24px_rgba(42,52,55,0.18)] outline-none transition-[background-color,box-shadow] duration-300 placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-0 focus:shadow-[0_0_26px_rgba(203,231,245,0.96),0_0_56px_rgba(209,228,254,0.48)] lg:px-8 lg:py-5 lg:text-lg"
                maxLength={24}
                placeholder="灵魂的称谓..."
                type="text"
                value={codename}
                onChange={(event) => setCodename(event.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="block font-label text-[11px] uppercase tracking-[0.2em] text-on-surface-variant lg:text-xs">
                选择您的当前心境
              </label>

              <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-3 rounded-[1.75rem] bg-white/45 px-4 py-4 lg:hidden">
                {MOOD_OPTIONS.map((option) => (
                  <MoodChip
                    key={option.id}
                    label={option.label}
                    name={option.icon}
                    selected={option.id === mood}
                    onClick={() => setMood(option.id)}
                  />
                ))}
              </div>

              <div className="hidden flex-wrap justify-center gap-3 lg:flex">
                {MOOD_OPTIONS.map((option) => (
                  <DesktopMoodPill
                    key={option.id}
                    label={option.label}
                    selected={option.id === mood}
                    onClick={() => setMood(option.id)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 lg:pt-8">
              <button
                aria-busy={isSubmitting}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-3.5 font-headline font-bold text-on-primary shadow-xl shadow-primary/10 transition-[filter,box-shadow,background-color] duration-300 ease-out hover:brightness-[1.05] hover:shadow-[0_20px_42px_-18px_rgba(72,98,110,0.44)] active:brightness-[0.96] active:shadow-[0_12px_24px_-16px_rgba(72,98,110,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-container/60 lg:px-12 lg:py-5"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#48626e_0%,#3c5662_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_58%)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,33,39,0.16),rgba(20,33,39,0.06))] opacity-0 transition-opacity duration-150 ease-out group-active:opacity-100" />
                <span className="relative flex items-center gap-3 text-sm uppercase tracking-[0.28em]">
                  唤醒私语
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                </span>
              </button>
            </div>
          </form>

          <p className="mt-12 font-label text-[10px] uppercase tracking-[0.3em] text-outline/70 lg:hidden">
            Zero Storage · Zero Logs · Anonymous Relay Only
          </p>
          <footer className="mt-24 hidden lg:block">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-outline/60">
              © MMXXIV ETHEREAL WHISPER · 保持匿名 保持共鸣
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
