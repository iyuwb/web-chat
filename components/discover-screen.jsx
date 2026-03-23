"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { DesktopSidebar, MobileNav } from "./app-chrome.jsx";
import { DiscoverEmptyState } from "./discover/discover-empty-state.jsx";
import { DiscoverHeader } from "./discover/discover-header.jsx";
import { DiscoverPeerCard } from "./discover/discover-peer-card.jsx";
import {
  PLACEHOLDER_ACTIONS,
  getMoodOption,
  getPeerAvatar,
} from "../lib/chat-ui-data.js";
import { useChat } from "./chat-provider.jsx";
import {
  formatMobilePresence,
  formatRelativeTime,
} from "../lib/chat-formatters.js";

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
  const {
    connectionState,
    disconnectSession,
    hasActiveChat,
    hasSession,
    navigateTo,
    peers,
    self,
    showToast,
    startChat,
  } = useChat();

  const [selectedPeerId, setSelectedPeerId] = useState("");
  const deferredPeers = useDeferredValue(peers);
  const visiblePeers = useMemo(
    () => deferredPeers.filter((peer) => peer.id !== self?.id),
    [deferredPeers, self?.id],
  );

  const selectedPeer = useMemo(
    () =>
      visiblePeers.some((peer) => peer.id === selectedPeerId)
        ? (visiblePeers.find((peer) => peer.id === selectedPeerId) ?? null)
        : null,
    [selectedPeerId, visiblePeers],
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
          onRestart={() => disconnectSession()}
        />

        <div className="flex min-h-screen flex-1 flex-col lg:h-screen">
          <main className="flex-1 overflow-y-auto px-6 pb-28 pt-6 lg:bg-white lg:px-12 lg:pb-16 lg:pt-10">
            <DiscoverHeader
              connectionLabel={getConnectionLabel(connectionState)}
              onlineCount={visiblePeers.length}
              onArchive={() => showToast(PLACEHOLDER_ACTIONS.archive)}
              onEchoes={() => showToast(PLACEHOLDER_ACTIONS.echoes)}
              onFingerprint={() => showToast(PLACEHOLDER_ACTIONS.fingerprint)}
              onNotifications={() =>
                showToast(PLACEHOLDER_ACTIONS.notifications)
              }
              onSettings={() => showToast(PLACEHOLDER_ACTIONS.settings)}
            />

            {visiblePeers.length === 0 ? (
              <DiscoverEmptyState />
            ) : (
              <section className="space-y-5 lg:space-y-0">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                  {visiblePeers.map((peer) => {
                    const mood = getMoodOption(peer.mood);
                    const selected = peer.id === selectedPeer?.id;
                    const avatar = getPeerAvatar(peer.id);
                    const presenceLabel = (
                      <>
                        <span className="lg:hidden">
                          {formatMobilePresence(peer.connectedAt)}
                        </span>
                        <span className="hidden lg:inline">
                          {formatRelativeTime(peer.connectedAt)}
                        </span>
                      </>
                    );

                    return (
                      <DiscoverPeerCard
                        key={peer.id}
                        mood={mood}
                        peer={{ ...peer, avatar }}
                        presenceLabel={presenceLabel}
                        selected={selected}
                        onSelect={() => setSelectedPeerId(peer.id)}
                        onStartChat={() => startChat(peer.id)}
                      />
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
                    {selectedPeer
                      ? `和 ${selectedPeer.codename} 开启私语`
                      : "开启私语"}
                  </button>
                </div>
              </section>
            )}

            <footer className="mt-12 hidden border-t border-slate-50 py-8 text-center font-label text-[10px] uppercase tracking-[0.28em] text-slate-400 lg:block">
              © 2026 ETHEREAL WHISPER · Keep Anonymous · Keep Resonant
            </footer>
          </main>
        </div>
      </div>

      <MobileNav
        active="discover"
        hasActiveChat={hasActiveChat}
        onChat={() =>
          hasActiveChat
            ? navigateTo("chat")
            : showToast("当前没有正在进行的对话。")
        }
        onDiscover={() => {}}
        onProfile={() => showToast(PLACEHOLDER_ACTIONS.profile)}
      />
    </div>
  );
}
