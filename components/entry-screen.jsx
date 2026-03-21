"use client";

import { Sparkles } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MOOD_OPTIONS } from "./prototype-data.js";
import { useChat } from "./chat-provider.jsx";
import { cx } from "../lib/cx.js";

function MoodPill({ label, selected, onClick }) {
  return (
    <button
      className={cx(
        "rounded-full border px-4 py-2 text-xs font-label font-medium leading-none transition-[background-color,border-color,color,box-shadow] duration-300 sm:px-5 sm:py-2.5 sm:text-sm lg:px-6",
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
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-[18rem] w-[18rem] rounded-full bg-primary-container/20 blur-[72px] sm:-bottom-32 sm:-left-16 sm:h-[26rem] sm:w-[26rem] sm:blur-[96px] lg:-bottom-[10%] lg:-left-[5%] lg:h-[40rem] lg:w-[40rem] lg:blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-[18rem] w-[18rem] rounded-full bg-tertiary-container/20 blur-[72px] sm:-right-16 sm:-top-24 sm:h-[26rem] sm:w-[26rem] sm:blur-[96px] lg:-right-[5%] lg:-top-[10%] lg:h-[40rem] lg:w-[40rem] lg:blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(rgba(72,98,110,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />

      <header className="fixed top-0 z-50 w-full bg-transparent px-5 py-6 sm:px-8 sm:py-7 lg:px-12 lg:py-8">
        <div className="font-headline text-[0.72rem] font-bold tracking-[0.32em] text-on-surface sm:text-[0.82rem] lg:text-base xl:text-lg">
          ETHEREAL WHISPER
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-5 pb-10 pt-28 sm:px-8 sm:pb-12 sm:pt-32 lg:px-8 lg:py-16">
        <div className="flex w-full max-w-[22rem] flex-col items-center px-0 py-4 text-center sm:max-w-xl sm:px-4 lg:px-8 lg:py-20">
          <div className="mb-10 space-y-4 sm:mb-12 sm:space-y-5 lg:mb-16 lg:space-y-6">
            <h1 className="font-headline text-[1.85rem] font-extrabold tracking-[0.06em] text-on-surface sm:text-[2.5rem] sm:tracking-[0.03em] lg:text-5xl lg:tracking-tight">
              开启虚幻对话
            </h1>
            <p className="mx-auto max-w-[20rem] text-[0.92rem] leading-7 text-on-surface-variant sm:max-w-md sm:text-base lg:max-w-xl lg:text-lg lg:font-light lg:leading-relaxed lg:tracking-wide">
              在这里，每个灵魂都是一个独特的频率。
            </p>
          </div>

          <form className="w-full space-y-7 sm:space-y-9 lg:space-y-12" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="mb-3 block font-label text-[11px] uppercase tracking-[0.2em] text-on-surface-variant sm:mb-4 lg:text-xs">
                设置你的代号
              </label>
              <input
                className="w-full rounded-full border-none bg-surface-container-highest/55 px-5 py-3 text-center font-headline text-[0.95rem] text-on-surface shadow-[0_12px_32px_-24px_rgba(42,52,55,0.18)] outline-none transition-[background-color,box-shadow] duration-300 placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-0 focus:shadow-[0_0_26px_rgba(203,231,245,0.96),0_0_56px_rgba(209,228,254,0.48)] sm:px-6 sm:py-4 sm:text-base lg:px-8 lg:py-5 lg:text-lg"
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

              <div className="flex flex-wrap justify-center gap-3">
                {MOOD_OPTIONS.map((option) => (
                  <MoodPill
                    key={option.id}
                    label={option.label}
                    selected={option.id === mood}
                    onClick={() => setMood(option.id)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-1 sm:pt-3 lg:pt-8">
              <button
                aria-busy={isSubmitting}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-7 py-3 font-headline font-bold text-on-primary shadow-xl shadow-primary/10 transition-[filter,box-shadow,background-color] duration-300 ease-out hover:brightness-[1.05] hover:shadow-[0_20px_42px_-18px_rgba(72,98,110,0.44)] active:brightness-[0.96] active:shadow-[0_12px_24px_-16px_rgba(72,98,110,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-container/60 sm:px-9 sm:py-4 lg:px-12 lg:py-5"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#48626e_0%,#3c5662_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_58%)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,33,39,0.16),rgba(20,33,39,0.06))] opacity-0 transition-opacity duration-150 ease-out group-active:opacity-100" />
                <span className="relative flex items-center gap-2.5 text-[0.72rem] uppercase tracking-[0.24em] sm:gap-3 sm:text-xs lg:text-sm lg:tracking-[0.28em]">
                  唤醒私语
                  <Sparkles className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] lg:h-5 lg:w-5" strokeWidth={2} />
                </span>
              </button>
            </div>
          </form>

          <footer className="mt-14 sm:mt-16 lg:mt-24">
            <p className="font-label text-[10px] uppercase tracking-[0.24em] text-outline/60 sm:tracking-[0.3em]">
              © MMXXIV ETHEREAL WHISPER · 保持匿名 保持共鸣
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
