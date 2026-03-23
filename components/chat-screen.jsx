"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DesktopSidebar, MobileNav } from "./app-chrome.jsx";
import { ChatComposer } from "./chat/chat-composer.jsx";
import { ChatFeed } from "./chat/chat-feed.jsx";
import { ChatHeader } from "./chat/chat-header.jsx";
import { ChatSidebar } from "./chat/chat-sidebar.jsx";
import {
  PLACEHOLDER_ACTIONS,
  getMoodOption,
  getPeerAvatar,
} from "../lib/chat-ui-data.js";
import { useChat } from "./chat-provider.jsx";
import { countVisibleChars, formatClock } from "../lib/chat-formatters.js";

function getDurationLabel(startedAt) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(startedAt).getTime()) / 60_000),
  );
  return `${minutes}m`;
}

export function ChatScreen() {
  const {
    activeChat,
    disconnectSession,
    hasActiveChat,
    hasSession,
    leaveChat,
    navigateTo,
    self,
    sendMessage,
    setTyping,
    showToast,
  } = useChat();

  const [draft, setDraft] = useState("");
  const feedRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

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
      mood: getMoodOption(activeChat.peer.mood),
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
          onRestart={() => disconnectSession()}
        />

        <main className="flex min-h-screen flex-1 flex-col lg:h-screen lg:overflow-hidden">
          <ChatHeader peerTyping={activeChat.peerTyping} />

          <div className="flex flex-1 lg:min-h-0">
            <section className="flex flex-1 flex-col">
              <ChatFeed
                activeChat={activeChat}
                feedRef={feedRef}
                formatClock={formatClock}
              />

              <ChatComposer
                draft={draft}
                textareaRef={textareaRef}
                onDraftChange={handleDraftChange}
                onHelp={() => showToast(PLACEHOLDER_ACTIONS.help)}
                onSubmit={handleSubmit}
              />
            </section>

            <ChatSidebar
              activeChat={activeChat}
              onLeaveChat={leaveChat}
              peerAvatar={getPeerAvatar(activeChat.peer.id)}
              stats={stats}
            />
          </div>
        </main>
      </div>

      <MobileNav
        active="chat"
        hasActiveChat={hasActiveChat}
        onChat={() => {}}
        onDiscover={() => navigateTo("discover")}
        onProfile={() => showToast(PLACEHOLDER_ACTIONS.profile)}
      />
    </div>
  );
}
