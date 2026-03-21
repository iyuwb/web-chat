"use client";

import {
  ArrowRight,
  Bell,
  Fingerprint,
  LoaderCircle,
  Settings2
} from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DesktopSidebar, MobileNav } from "./app-chrome.jsx";
import { AvatarImage } from "./avatar-image.jsx";
import {
  PLACEHOLDER_ACTIONS,
  formatMobilePresence,
  formatRelativeTime,
  getMoodOption,
  getPeerAvatar
} from "./prototype-data.js";
import { useChat } from "./chat-provider.jsx";
import { cx } from "../lib/cx.js";

function getConnectionLabel(connectionState) {
  switch (connectionState) {
    case "connected":
      return "在线";
    case "connecting":
      return "连接中";
    case "reconnecting":
      return "重连中";
    default:
      return "未连接";
  }
}

export function DiscoverScreen() {
  const router = useRouter();
  const {
    connectionState,
    disconnectSession,
    hasActiveChat,
    hasSession,
    peers,
    self,
    showToast,
    startChat
  } = useChat();

  const [selectedPeerId, setSelectedPeerId] = useState("");
  const deferredPeers = useDeferredValue(peers);

  useEffect(() => {
    if (!hasSession) {
      startTransition(() => {
        router.replace("/");
      });
    }
  }, [hasSession, router]);

  const selectedPeer = useMemo(
    () =>
      deferredPeers.some((peer) => peer.id === selectedPeerId)
        ? deferredPeers.find((peer) => peer.id === selectedPeerId) ?? null
        : null,
    [deferredPeers, selectedPeerId]
  );

  if (!hasSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background lg:h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1280px] lg:h-screen">
        <DesktopSidebar
          codename={self?.codename}
          onPlaceholder={showToast}
          onRestart={() => disconnectSession({ navigateTo: "/" })}
        />

        <div className="flex min-h-screen flex-1 flex-col lg:h-screen">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-[#f8fafb]/80 px-6 backdrop-blur-xl lg:border-b lg:border-slate-50 lg:bg-white">
            <div className="lg:hidden">
              <h1 className="font-headline text-xl font-bold tracking-tight text-on-surface">
                Whisper
              </h1>
              <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">
                {getConnectionLabel(connectionState)}
              </p>
            </div>

            <div className="hidden items-center space-x-12 lg:flex">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                虚幻对谈
              </span>
              <nav className="flex h-full items-center space-x-8">
                <div className="relative flex h-full items-center">
                  <button className="text-sm font-semibold text-cyan-600" type="button">
                    发现共鸣
                  </button>
                  <div className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-cyan-600" />
                </div>
                <button
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-800"
                  type="button"
                  onClick={() => showToast(PLACEHOLDER_ACTIONS.archive)}
                >
                  归档记录
                </button>
                <button
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-800"
                  type="button"
                  onClick={() => showToast(PLACEHOLDER_ACTIONS.echoes)}
                >
                  我的回响
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="hidden rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 lg:inline-flex"
                type="button"
                onClick={() => showToast(PLACEHOLDER_ACTIONS.settings)}
              >
                <Settings2 className="h-5 w-5" strokeWidth={1.9} />
              </button>
              <button
                className="hidden rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 lg:inline-flex"
                type="button"
                onClick={() => showToast(PLACEHOLDER_ACTIONS.fingerprint)}
              >
                <Fingerprint className="h-5 w-5" strokeWidth={1.9} />
              </button>
              <button
                className="rounded-full p-2 text-[#78909C] transition-colors hover:bg-slate-50 lg:hidden"
                type="button"
                onClick={() => showToast(PLACEHOLDER_ACTIONS.notifications)}
              >
                <Bell className="h-5 w-5" strokeWidth={1.9} />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 pb-28 pt-6 lg:bg-white lg:px-12 lg:pb-16 lg:pt-10">
            <section className="mb-10 lg:mb-12">
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface lg:text-5xl">
                发现共鸣
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <p className="text-sm font-medium text-on-surface-variant lg:text-lg lg:font-light">
                  当前在线的 {deferredPeers.length} 位匿名旅人
                </p>
              </div>
            </section>

            {deferredPeers.length === 0 ? (
              <section className="rounded-[2rem] bg-surface-container-lowest p-10 text-center shadow-ambient lg:rounded-[3rem] lg:p-16">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-container/40 lg:h-16 lg:w-16">
                  <LoaderCircle
                    className="h-6 w-6 animate-spin text-on-tertiary-container"
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold text-on-surface lg:text-2xl">
                  正在等待新的匿名访客
                </h3>
                <p className="mx-auto mt-3 max-w-xl leading-relaxed text-on-surface-variant">
                  当前没有可匹配的在线对象。这里不会保存任何用户信息，新的会话进入后会实时出现在列表中。
                </p>
              </section>
            ) : (
              <section className="space-y-5 lg:space-y-0">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                  {deferredPeers.map((peer) => {
                    const mood = getMoodOption(peer.mood);
                    const selected = peer.id === selectedPeer?.id;

                    return (
                      <article
                        key={peer.id}
                        className={cx(
                          "group relative flex flex-col rounded-[2rem] border border-slate-50 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:rounded-[3rem] lg:p-8",
                          selected && "ring-2 ring-primary/20"
                        )}
                      >
                        <button
                          className="absolute inset-0 rounded-[inherit] lg:hidden"
                          type="button"
                          onClick={() => setSelectedPeerId(peer.id)}
                        >
                          <span className="sr-only">选择 {peer.codename}</span>
                        </button>

                        <div className="relative mb-6 self-start lg:mb-8 lg:self-center">
                          <AvatarImage
                            alt={peer.codename}
                            className="h-16 w-16 lg:h-20 lg:w-20"
                            imageClassName="border-[3px] border-white"
                            sizes="80px"
                            src={getPeerAvatar(peer.id)}
                          />
                          <div className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-400" />
                        </div>

                        <div className="space-y-3 lg:text-center">
                          <div>
                            <h3 className="truncate text-xl font-bold text-slate-900 lg:text-2xl">
                              {peer.codename}
                            </h3>
                            <p className="font-label text-[11px] tracking-wide text-slate-400 lg:text-sm">
                              <span className="lg:hidden">
                                {formatMobilePresence(peer.connectedAt)}
                              </span>
                              <span className="hidden lg:inline">
                                {formatRelativeTime(peer.connectedAt)}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 lg:justify-center">
                            {mood.desktopTags.map((tag) => (
                              <span
                                key={`${peer.id}-${tag}`}
                                className="rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500 lg:px-4 lg:text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          className={cx(
                            "mt-6 hidden w-full items-center justify-between rounded-full px-6 py-4 font-medium transition-all lg:flex",
                            selected
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-highest text-slate-600 hover:bg-slate-200"
                          )}
                          type="button"
                          onClick={() => startChat(peer.id)}
                        >
                          <span className="ml-2 text-sm tracking-wide">开启私语</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </article>
                    );
                  })}
                </div>

                <div className="pt-6 lg:hidden">
                  <button
                    className="w-full rounded-full bg-primary px-6 py-4 font-headline text-base font-bold text-on-primary shadow-[0_8px_30px_rgba(72,98,110,0.2)] transition-transform duration-200 active:scale-95 disabled:opacity-40"
                    disabled={!selectedPeer}
                    type="button"
                    onClick={() =>
                      selectedPeer
                        ? startChat(selectedPeer.id)
                        : showToast("请先选择一位在线访客。")
                    }
                  >
                    {selectedPeer ? `和 ${selectedPeer.codename} 开启私语` : "开启私语"}
                  </button>
                </div>
              </section>
            )}

            <footer className="mt-12 hidden border-t border-slate-50 py-8 text-center font-label text-[10px] uppercase tracking-[0.28em] text-slate-400 lg:block">
              © 2026 Ethereal Whisper · Keep Anonymous · Keep Resonant
            </footer>
          </main>
        </div>
      </div>

      <MobileNav
        active="discover"
        hasActiveChat={hasActiveChat}
        onChat={() =>
          hasActiveChat
            ? startTransition(() => {
                router.push("/chat");
              })
            : showToast("当前没有正在进行的对话。")
        }
        onDiscover={() => {}}
        onProfile={() => showToast(PLACEHOLDER_ACTIONS.profile)}
      />
    </div>
  );
}
