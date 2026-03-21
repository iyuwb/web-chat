"use client";

import {
  MessageCircleMore,
  Plus,
  SendHorizontal,
  Shield,
  Smile,
  Trash2,
  UserRound
} from "lucide-react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { DesktopSidebar, MobileNav } from "./app-chrome.jsx";
import { AvatarImage } from "./avatar-image.jsx";
import {
  PLACEHOLDER_ACTIONS,
  countVisibleChars,
  formatClock,
  getMoodOption,
  getPeerAvatar
} from "./prototype-data.js";
import { useChat } from "./chat-provider.jsx";
import { cx } from "../lib/cx.js";

function getDurationLabel(startedAt) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60_000));
  return `${minutes}m`;
}

export function ChatScreen() {
  const router = useRouter();
  const {
    activeChat,
    disconnectSession,
    hasActiveChat,
    hasSession,
    leaveChat,
    self,
    sendMessage,
    setTyping,
    showToast
  } = useChat();

  const [draft, setDraft] = useState("");
  const feedRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (!hasSession) {
      startTransition(() => {
        router.replace("/");
      });
      return;
    }

    if (!hasActiveChat) {
      startTransition(() => {
        router.replace("/discover");
      });
    }
  }, [hasActiveChat, hasSession, router]);

  useEffect(() => {
    const feed = feedRef.current;

    if (!feed) {
      return;
    }

    feed.scrollTop = feed.scrollHeight;
  }, [activeChat?.messages.length, activeChat?.peerTyping]);

  useEffect(() => {
    return () => {
      window.clearTimeout(typingTimerRef.current);
    };
  }, []);

  const stats = useMemo(() => {
    if (!activeChat) {
      return null;
    }

    return {
      chars: countVisibleChars(activeChat.messages),
      duration: getDurationLabel(activeChat.startedAt),
      mood: getMoodOption(activeChat.peer.mood)
    };
  }, [activeChat]);

  if (!hasSession || !activeChat || !stats) {
    return null;
  }

  function resizeTextarea(target) {
    if (!target) {
      return;
    }

    target.style.height = "0px";
    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
  }

  function resetTextarea() {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "";
  }

  function handleDraftChange(event) {
    const nextValue = event.target.value;
    setDraft(nextValue);
    resizeTextarea(event.target);
    setTyping(nextValue.trim().length > 0);

    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      setTyping(false);
    }, 900);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const wasSent = await sendMessage(draft);

    if (!wasSent) {
      return;
    }

    window.clearTimeout(typingTimerRef.current);
    setDraft("");
    resetTextarea();
  }

  return (
    <div className="min-h-screen bg-surface lg:h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1280px] lg:h-screen">
        <DesktopSidebar
          codename={self?.codename}
          onPlaceholder={showToast}
          onRestart={() => disconnectSession({ navigateTo: "/" })}
        />

        <main className="flex min-h-screen flex-1 flex-col lg:h-screen lg:overflow-hidden">
          <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-[#f8fafb]/70 px-6 backdrop-blur-[20px] lg:static lg:border-b lg:border-white/10 lg:bg-white/70">
            <div className="flex items-center gap-3">
              <MessageCircleMore className="h-5 w-5 text-[#78909C]" strokeWidth={1.8} />
              <span className="font-headline text-xl font-bold tracking-tight text-[#2a3437]">
                Whisper
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-label text-[10px] font-semibold uppercase tracking-widest text-primary-dim/60">
                Status
              </span>
              <span className="text-sm font-medium italic text-primary-dim">
                {activeChat.peerTyping ? "对方正在输入..." : "Secure relay"}
              </span>
            </div>
          </header>

          <div className="flex flex-1 lg:min-h-0">
            <section className="flex flex-1 flex-col">
              <div
                ref={feedRef}
                className="hide-scrollbar flex min-h-screen flex-1 flex-col gap-8 overflow-y-auto px-6 pb-48 pt-24 lg:min-h-0 lg:px-8 lg:pb-8 lg:pt-8"
              >
                <div className="my-2 flex justify-center lg:my-0">
                  <span className="font-label text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/40">
                    Today
                  </span>
                </div>

                {activeChat.messages.length === 0 ? (
                  <>
                    <div className="flex justify-center">
                      <div className="rounded-full bg-tertiary-container/30 px-4 py-1.5">
                        <span className="font-label text-[10px] font-medium tracking-wide text-on-tertiary-container">
                          Secure connection established
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center py-10 opacity-50">
                      <Shield className="mb-3 h-8 w-8 text-primary" strokeWidth={1.7} />
                      <p className="font-headline text-lg italic text-on-surface">
                        对话从这里开始
                      </p>
                    </div>
                  </>
                ) : null}

                {activeChat.messages.map((message, index) => {
                  if (message.kind === "system") {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <div className="rounded-full bg-tertiary-container/30 px-4 py-1.5">
                          <span className="font-label text-[10px] font-medium tracking-wide text-on-tertiary-container">
                            {message.text}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (message.kind === "peer") {
                    const showIdentity = activeChat.messages[index - 1]?.kind !== "peer";

                    return (
                      <div key={message.id} className="flex max-w-[85%] flex-col gap-1">
                        {showIdentity ? (
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-container">
                              <UserRound className="h-4 w-4 text-on-tertiary-container" strokeWidth={2} />
                            </div>
                            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                              Stranger
                            </span>
                          </div>
                        ) : null}
                        <div className="rounded-lg rounded-tl-none bg-secondary-container p-4 text-on-surface shadow-sm lg:px-6 lg:py-4 lg:rounded-[1.5rem] lg:rounded-bl-[0.5rem]">
                          <p className="leading-relaxed">{message.text}</p>
                        </div>
                        <span className="ml-1 mt-1 font-label text-[10px] text-on-surface-variant/70">
                          {formatClock(message.sentAt)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className="ml-auto flex max-w-[85%] flex-col gap-1 items-end">
                      <div className="rounded-lg rounded-tr-none bg-primary-container p-4 text-on-primary-container shadow-sm lg:px-6 lg:py-4 lg:rounded-[1.5rem] lg:rounded-br-[0.5rem]">
                        <p className="leading-relaxed">{message.text}</p>
                      </div>
                      <span className="mr-1 mt-1 font-label text-[10px] text-on-surface-variant/70">
                        {formatClock(message.sentAt)} · Read
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="fixed bottom-24 left-0 z-40 w-full px-6 lg:static lg:px-8 lg:pb-8">
                <form
                  className="mx-auto flex max-w-3xl items-end gap-3 rounded-full border border-outline-variant/10 bg-surface-container-lowest/80 p-2 shadow-[0_8px_32px_rgba(42,52,55,0.08)] backdrop-blur-xl"
                  onSubmit={handleSubmit}
                >
                  <button
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-container"
                    type="button"
                    onClick={() => showToast(PLACEHOLDER_ACTIONS.help)}
                  >
                    <Plus className="h-5 w-5 text-outline" strokeWidth={2} />
                  </button>

                  <div className="flex-1 pb-1">
                    <textarea
                      ref={textareaRef}
                      className="hide-scrollbar w-full resize-none border-none bg-transparent py-3 text-base text-on-surface placeholder:text-outline-variant/60 focus:ring-0"
                      placeholder="Whisper something..."
                      rows={1}
                      value={draft}
                      onChange={handleDraftChange}
                    />
                  </div>

                  <button
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-container"
                    type="button"
                    onClick={() => showToast(PLACEHOLDER_ACTIONS.help)}
                  >
                    <Smile className="h-5 w-5 text-outline" strokeWidth={1.9} />
                  </button>

                  <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95">
                    <SendHorizontal className="h-5 w-5" strokeWidth={2.2} />
                  </button>
                </form>
              </div>
            </section>

            <aside className="hidden w-80 shrink-0 flex-col border-l border-white/10 bg-surface-container-low p-8 lg:flex">
              <div className="mb-10 text-center">
                <div className="mx-auto mb-4 rounded-full bg-gradient-to-tr from-primary-fixed to-tertiary-fixed p-1 shadow-xl shadow-primary/10">
                  <AvatarImage
                    alt={activeChat.peer.codename}
                    className="h-24 w-24"
                    sizes="96px"
                    src={getPeerAvatar(activeChat.peer.id)}
                  />
                </div>
                <h3 className="font-headline text-lg font-bold">{activeChat.peer.codename}</h3>
                <p className="text-sm italic text-on-surface-variant">
                  “零存储的临时同行者”
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    聊天统计
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="字数" value={`${stats.chars}`} />
                    <StatCard label="时长" value={stats.duration} />
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    情绪标签
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.mood.desktopTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-medium text-on-primary-fixed"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="rounded-2xl border border-white bg-white/50 p-4">
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    当前对话只存在于这次临时会话中。关闭页面、断线或主动销毁后，消息不会被保存。
                  </p>
                </div>

                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-widest text-error transition-colors hover:bg-error-container/10"
                  type="button"
                  onClick={leaveChat}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                  销毁对话
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>

      <MobileNav
        active="chat"
        hasActiveChat={hasActiveChat}
        onChat={() => {}}
        onDiscover={() =>
          startTransition(() => {
            router.push("/discover");
          })
        }
        onProfile={() => showToast(PLACEHOLDER_ACTIONS.profile)}
      />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <span className="block text-xl font-bold">{value}</span>
      <span className="text-[10px] uppercase text-on-surface-variant">{label}</span>
    </div>
  );
}
