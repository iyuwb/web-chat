"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import {
  CURRENT_USER_AVATAR,
  MOOD_OPTIONS,
  PLACEHOLDER_ACTIONS,
  getMoodOption,
  getPeerAvatar
} from "./prototype-data.js";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getConnectionLabel(state) {
  if (state === "connected") {
    return "在线";
  }

  if (state === "connecting") {
    return "连接中";
  }

  return "未连接";
}

function getInitials(name) {
  const chars = Array.from((name || "EW").trim());
  return (chars.slice(0, 2).join("") || "EW").toUpperCase();
}

function formatRelativeTime(isoString) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(isoString).getTime()) / 60000));

  if (minutes < 60) {
    return `活跃于 ${minutes} 分钟前`;
  }

  return `活跃于 ${Math.floor(minutes / 60)} 小时前`;
}

function formatMobilePresence(isoString) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(isoString).getTime()) / 60000));

  if (minutes < 2) {
    return "刚刚";
  }

  return `${minutes} 分钟前`;
}

function formatClock(isoString) {
  return new Date(isoString).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function countVisibleChars(messages) {
  return messages.reduce((total, item) => {
    if (item.kind === "system") {
      return total;
    }

    return total + Array.from(item.text.replace(/\s+/g, "")).length;
  }, 0);
}

function Toast({ message }) {
  return (
    <div
      className={cx(
        "pointer-events-none fixed left-1/2 top-4 z-[80] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-on-surface px-4 py-2 text-sm text-on-primary shadow-xl transition duration-200",
        message ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
      )}
    >
      {message || ""}
    </div>
  );
}

function MoodSelector({ mood, onSelect, mobile = false }) {
  if (mobile) {
    return (
      <div className="flex justify-between items-center gap-4">
        {MOOD_OPTIONS.map((item) => (
          <button
            key={item.id}
            className="group flex flex-col items-center gap-3"
            type="button"
            onClick={() => onSelect(item.id)}
          >
            <div
              className={cx(
                "w-14 h-14 rounded-full flex items-center justify-center border border-outline-variant/10 transition-all duration-300",
                item.id === mood
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                  : "bg-surface-container-lowest text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container"
              )}
            >
              <span
                className="material-symbols-outlined"
                style={item.id === mood ? { fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" } : undefined}
              >
                {item.icon}
              </span>
            </div>
            <span
              className={cx(
                "font-label text-xs font-semibold",
                item.id === mood ? "text-on-surface" : "text-on-secondary-fixed-variant"
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {MOOD_OPTIONS.map((item) => (
        <button
          key={item.id}
          className={cx(
            "px-6 py-2.5 rounded-full text-sm font-label transition-all duration-300",
            item.id === mood
              ? "bg-primary-container text-on-primary-container font-medium shadow-sm"
              : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:border-transparent"
          )}
          type="button"
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function DesktopSidebar({ codename, onNewDialogue, onPlaceholder }) {
  return (
    <aside className="flex flex-col py-8 h-full w-72 bg-slate-50 border-r-0 shadow-[40px_0_60px_-15px_rgba(42,52,55,0.05)] shrink-0">
      <div className="px-8 mb-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-primary-fixed-dim p-0.5">
            <img
              alt="The Seeker avatar"
              className="w-full h-full rounded-full object-cover border-2 border-white"
              src={CURRENT_USER_AVATAR}
            />
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-lg tracking-tight">{codename || "The Seeker"}</h3>
            <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Status: Ghost</p>
          </div>
        </div>
        <button
          className="w-full py-4 px-6 bg-primary text-on-primary rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2 active:scale-[0.98]"
          type="button"
          onClick={onNewDialogue}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}>
            add
          </span>
          <span>New Dialogue</span>
        </button>
      </div>
      <nav className="flex-1 space-y-1">
        <button className="bg-blue-50 text-blue-600 rounded-full mx-4 py-3 px-6 font-medium flex items-center space-x-4 w-[calc(100%-2rem)] text-left">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
            waves
          </span>
          <span className="text-sm font-medium">发现共鸣</span>
        </button>
        <button
          className="text-slate-500 mx-4 py-3 px-6 hover:bg-slate-50 rounded-full transition-colors flex items-center space-x-4 w-[calc(100%-2rem)] text-left"
          type="button"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.archive)}
        >
          <span className="material-symbols-outlined">archive</span>
          <span className="text-sm font-medium">归档记录</span>
        </button>
        <button
          className="text-slate-500 mx-4 py-3 px-6 hover:bg-slate-50 rounded-full transition-colors flex items-center space-x-4 w-[calc(100%-2rem)] text-left"
          type="button"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.echoes)}
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-sm font-medium">我的回响</span>
        </button>
        <button
          className="text-slate-500 mx-4 py-3 px-6 hover:bg-slate-50 rounded-full transition-colors flex items-center space-x-4 w-[calc(100%-2rem)] text-left"
          type="button"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.profile)}
        >
          <span className="material-symbols-outlined">fingerprint</span>
          <span className="text-sm font-medium">Profile</span>
        </button>
      </nav>
      <div className="px-8 mt-auto pt-8 border-t border-surface-container/50">
        <button
          className="p-4 rounded-3xl bg-surface-container-low flex items-center justify-between w-full"
          type="button"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.theme)}
        >
          <span className="material-symbols-outlined text-primary">dark_mode</span>
          <div className="w-10 h-5 bg-outline-variant/30 rounded-full relative">
            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all"></div>
          </div>
        </button>
      </div>
    </aside>
  );
}

function DesktopEntryScreen({
  codename,
  mood,
  onCodenameChange,
  onMoodChange,
  onSubmit,
  onPlaceholder
}) {
  return (
    <div className="hidden lg:block min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-8 bg-transparent">
        <div className="text-xl font-bold tracking-widest text-on-surface uppercase font-headline">
          Ethereal Whisper
        </div>
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.language)}>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              language
            </span>
          </button>
          <button type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.help)}>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              help_outline
            </span>
          </button>
        </div>
      </header>

      <main className="min-h-screen flex items-center justify-center asymmetric-gradient relative overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[40rem] h-[40rem] bg-tertiary-container/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[40rem] h-[40rem] bg-primary-container/20 rounded-full blur-[120px]"></div>

        <div className="max-w-xl w-full px-8 py-20 z-10 flex flex-col items-center text-center">
          <div className="mb-16 space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight font-headline text-on-surface">
              开启虚幻对话
            </h1>
            <p className="text-lg font-light text-on-surface-variant tracking-wide leading-relaxed">
              在这里，每个灵魂都是一个独特的频率。
            </p>
          </div>

          <form className="w-full space-y-12" onSubmit={onSubmit}>
            <div className="group transition-all duration-500">
              <label className="block text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant mb-4 text-center">
                设置您的代号
              </label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-highest/50 border-none rounded-full px-8 py-5 text-lg text-center font-headline text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
                  placeholder="灵魂的称谓..."
                  type="text"
                  value={codename}
                  onChange={(event) => onCodenameChange(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant text-center">
                选择您当前的心境
              </label>
              <MoodSelector mood={mood} onSelect={onMoodChange} />
            </div>

            <div className="pt-8">
              <button className="group relative inline-flex items-center justify-center px-12 py-5 font-headline font-bold text-on-primary bg-primary rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dim opacity-100"></div>
                <span className="relative flex items-center gap-3 tracking-widest uppercase text-sm">
                  进入对话
                  <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                </span>
              </button>
            </div>
          </form>

          <footer className="mt-24">
            <p className="text-[10px] font-label uppercase tracking-[0.3em] text-outline/60">
              © MMXXIV ETHEREAL WHISPER · 保持匿名 保持共鸣
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

function MobileEntryScreen({ codename, mood, onCodenameChange, onMoodChange, onSubmit }) {
  return (
    <main className="lg:hidden bg-ethereal-gradient font-body text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <div className="relative flex flex-col items-center justify-between min-h-screen px-8 py-16 md:max-w-md mx-auto overflow-hidden">
        <div className="w-full text-center space-y-6 mt-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-surface-container-lowest shadow-sm mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">bubble_chart</span>
          </div>
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface leading-tight text-center">
            开启虚幻对话
          </h1>
          <p className="font-body text-on-surface-variant text-lg opacity-80 mx-auto leading-relaxed text-center w-full">
            在寂静的维度里，遇见另一个未知的自己。
          </p>
        </div>

        <form className="w-full space-y-12" onSubmit={onSubmit}>
          <div className="input-glow group relative flex items-center bg-surface-container-highest rounded-full py-6 transition-all duration-500 px-4">
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-outline placeholder:font-light text-center"
              placeholder="灵魂的称谓..."
              type="text"
              value={codename}
              onChange={(event) => onCodenameChange(event.target.value)}
            />
          </div>

          <div className="space-y-6">
            <p className="font-label text-[11px] uppercase tracking-[0.2em] text-center text-on-surface-variant opacity-60 text-center w-full">
              选择您当前的心境
            </p>
            <MoodSelector mood={mood} onSelect={onMoodChange} mobile />
          </div>

          <div className="w-full pt-8">
            <button className="group relative w-full bg-on-surface text-surface py-6 rounded-full flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-xl shadow-on-surface/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dim/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative font-headline font-bold text-lg tracking-wide">进入对话</span>
              <span className="relative material-symbols-outlined text-2xl group-hover:translate-x-2 transition-transform duration-300">
                arrow_forward
              </span>
            </button>
          </div>
        </form>

        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-tertiary-fixed/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-container/30 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
      </div>
    </main>
  );
}

function DesktopDiscoverScreen({
  codename,
  peers,
  onNewDialogue,
  onPlaceholder,
  onStartChat
}) {
  return (
    <div className="hidden lg:block">
      <div className="flex h-screen w-full max-w-[1280px] mx-auto">
        <DesktopSidebar codename={codename} onNewDialogue={onNewDialogue} onPlaceholder={onPlaceholder} />

        <main className="flex-1 bg-white h-full relative flex flex-col">
          <header className="w-full h-16 bg-white border-b border-slate-50 flex justify-between items-center px-8 shrink-0">
            <div className="flex items-center space-x-12 h-full">
              <span className="text-2xl font-bold tracking-tight text-slate-900">虚幻对话</span>
              <nav className="flex space-x-8 items-center h-full">
                <div className="relative flex items-center h-full">
                  <button className="text-cyan-600 font-semibold text-sm">发现共鸣</button>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-600 rounded-t-full"></div>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-800 transition-colors text-sm font-medium"
                  type="button"
                  onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.archive)}
                >
                  归档记录
                </button>
                <button
                  className="text-slate-400 hover:text-slate-800 transition-colors text-sm font-medium"
                  type="button"
                  onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.echoes)}
                >
                  我的回响
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-slate-500 hover:text-slate-800 transition-colors" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.settings)}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
                  settings
                </span>
              </button>
              <button className="text-slate-500 hover:text-slate-800 transition-colors" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.fingerprint)}>
                <span className="material-symbols-outlined">fingerprint</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pt-10 pb-20 px-12 bg-white">
            <div className="mb-12">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-3 font-headline">发现共鸣</h1>
              <p className="text-slate-400 text-lg font-light">当前在线的 {peers.length} 位匿名旅人</p>
            </div>

            {peers.length === 0 ? (
              <div className="rounded-[3rem] bg-slate-50 p-16 text-center text-slate-400 shadow-ambient">
                <span className="material-symbols-outlined text-5xl mb-4">hourglass_top</span>
                <p className="text-lg">等待另一位访客进入。当前没有可匹配的匿名对象。</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-8">
                {peers.map((peer) => {
                  const mood = getMoodOption(peer.mood);

                  return (
                    <article
                      key={peer.id}
                      className="group relative bg-white p-8 rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col border border-slate-50"
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-8 self-center relative">
                        <img alt={peer.codename} className="w-full h-full object-cover" src={getPeerAvatar(peer.id)} />
                        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 bg-green-400 border-[3px] border-white rounded-full"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1 text-center">{peer.codename}</h3>
                      <p className="text-sm text-slate-400 font-label mb-8 text-center">{formatRelativeTime(peer.connectedAt)}</p>
                      <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {mood.desktopTags.map((tag) => (
                          <span key={tag} className="px-4 py-1.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        className="mt-auto w-full py-4 px-6 bg-[#d9e4e8] text-slate-600 rounded-full font-medium hover:bg-slate-200 transition-all flex items-center justify-between group/btn"
                        type="button"
                        onClick={() => onStartChat(peer.id)}
                      >
                        <span className="text-sm tracking-wide ml-2">开启私语</span>
                        <span className="material-symbols-outlined text-xl group-hover/btn:translate-x-1 transition-transform">east</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DesktopChatScreen({
  codename,
  activeChat,
  draft,
  onDraftChange,
  onSubmit,
  onLeaveChat,
  onNewDialogue,
  onPlaceholder,
  desktopFeedRef,
  desktopTextareaRef
}) {
  const mood = getMoodOption(activeChat.peer.mood);
  const messages = activeChat.messages;
  const wordCount = countVisibleChars(messages);
  const durationMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(activeChat.startedAt).getTime()) / 60000)
  );

  return (
    <div className="hidden lg:block">
      <div className="flex h-screen w-full max-w-[1280px] mx-auto">
        <DesktopSidebar codename={codename} onNewDialogue={onNewDialogue} onPlaceholder={onPlaceholder} />

        <main className="flex-1 flex flex-col bg-surface h-full relative overflow-hidden">
          <header className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-8 h-16 font-['Manrope'] antialiased tracking-tight shrink-0">
            <div className="flex items-center space-x-12">
              <span className="text-2xl font-bold tracking-tighter text-slate-800">虚幻对话</span>
              <nav className="flex space-x-8 items-center h-full">
                <button className="text-cyan-600 font-semibold border-b-2 border-cyan-600 py-5 h-full">发现共鸣</button>
                <button
                  className="text-slate-500 hover:text-slate-800 transition-colors py-5 h-full"
                  type="button"
                  onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.archive)}
                >
                  归档记录
                </button>
                <button
                  className="text-slate-500 hover:text-slate-800 transition-colors py-5 h-full"
                  type="button"
                  onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.echoes)}
                >
                  我的回响
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50/50 transition-all active:scale-95 duration-200" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.settings)}>
                <span className="material-symbols-outlined text-slate-500">settings</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50/50 transition-all active:scale-95 duration-200" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.fingerprint)}>
                <span className="material-symbols-outlined text-slate-500">fingerprint</span>
              </button>
              <button
                className="bg-primary text-on-primary px-5 py-2 rounded-full font-medium text-sm active:scale-95 transition-transform ml-2"
                type="button"
                onClick={onNewDialogue}
              >
                发起新聊天
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <section className="flex-1 flex flex-col relative">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-tertiary-container/80 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-sm">
                  <div className={cx("w-2 h-2 rounded-full", activeChat.peerTyping ? "bg-tertiary animate-pulse" : "bg-primary")}></div>
                  <span className="font-label text-xs font-medium text-on-tertiary-container tracking-tight">
                    {activeChat.peerTyping ? `${activeChat.peer.codename} 正在输入...` : "Secure relay active"}
                  </span>
                </div>
              </div>

              <div ref={desktopFeedRef} className="flex-1 overflow-y-auto p-8 chat-scroll flex flex-col space-y-8">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center py-12 opacity-40">
                    <span className="material-symbols-outlined text-4xl mb-2">auto_awesome</span>
                    <p className="font-headline text-lg italic">对话从这里开始。</p>
                  </div>
                ) : null}

                {messages.map((message, index) => {
                  if (message.kind === "system") {
                    return (
                      <div key={message.id} className="flex justify-center mt-4">
                        <div className="bg-tertiary-container/30 px-4 py-1.5 rounded-full">
                          <span className="font-label text-[10px] text-on-tertiary-container font-medium tracking-wide">
                            {message.text}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (message.kind === "peer") {
                    const previousKind = messages[index - 1]?.kind;
                    const showMeta = previousKind !== "peer";

                    return (
                      <div key={message.id} className="flex flex-col items-start max-w-[85%] self-start group">
                        {showMeta ? (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-tertiary-container text-sm">person</span>
                            </div>
                            <span className="font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                              {activeChat.peer.codename}
                            </span>
                          </div>
                        ) : null}
                        <div className="bg-secondary-container text-on-secondary-container px-6 py-4 rounded-[1.5rem] rounded-bl-[0.5rem] shadow-sm relative">
                          <p className="leading-relaxed">{message.text}</p>
                        </div>
                        <span className="font-label text-[10px] mt-2 ml-1 text-on-surface-variant tracking-wider uppercase opacity-60">
                          {formatClock(message.sentAt)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className="flex flex-col items-end max-w-[85%] self-end group">
                      <div className="bg-primary-container text-on-primary-container px-6 py-4 rounded-[1.5rem] rounded-br-[0.5rem] shadow-sm">
                        <p className="leading-relaxed">{message.text}</p>
                      </div>
                      <span className="font-label text-[10px] mt-2 mr-1 text-on-surface-variant tracking-wider uppercase opacity-60">
                        {formatClock(message.sentAt)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <footer className="p-8 pt-0 w-full max-w-3xl mx-auto shrink-0">
                <form className="relative group" onSubmit={onSubmit}>
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center bg-surface-container-highest rounded-full p-2 pr-3 shadow-inner border border-transparent focus-within:bg-surface-container-lowest focus-within:border-primary/10 transition-all duration-300">
                    <button className="material-symbols-outlined p-3 text-on-surface-variant hover:text-primary transition-colors" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.help)}>
                      add_circle
                    </button>
                    <textarea
                      ref={desktopTextareaRef}
                      className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 font-body resize-none hide-scrollbar"
                      placeholder="轻声诉说你的想法..."
                      rows={1}
                      value={draft}
                      onChange={(event) => onDraftChange(event.target.value, event.target)}
                    />
                    <div className="flex items-center gap-2">
                      <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.help)}>
                        sentiment_satisfied
                      </button>
                      <button className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary-dim shadow-lg shadow-primary/20 active:scale-90 transition-all">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
                          send
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
                <p className="text-center mt-6 font-label text-[10px] text-on-surface-variant/40 tracking-[0.2em] uppercase">
                  端到端匿名语境 · 不留日志
                </p>
              </footer>
            </section>

            <aside className="w-[320px] bg-slate-50/80 p-8 flex flex-col gap-8 shrink-0">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-6">
                  <img alt={activeChat.peer.codename} className="w-full h-full rounded-full object-cover" src={getPeerAvatar(activeChat.peer.id)} />
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{activeChat.peer.codename}</h2>
                <p className="text-slate-500 text-sm italic">“应答的朦胧来客”</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">聊天统计</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="text-4xl font-bold text-slate-900">{messages.filter((item) => item.kind !== "system").length}</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mt-2">字串</div>
                  </div>
                  <div className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="text-4xl font-bold text-slate-900">{durationMinutes}m</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mt-2">时长</div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">情绪分析</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-white rounded-full text-xs text-slate-500">{mood.label}</span>
                  {mood.desktopTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-[#eaf2ff] rounded-full text-xs text-slate-500">
                      {tag}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 bg-white rounded-full text-xs text-slate-500">{wordCount} 字</span>
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <div className="bg-white rounded-3xl p-6 text-sm text-slate-500 leading-7 shadow-sm">
                  此对话仅存储在临时在线会话中。关闭窗口后将立即消隐。
                </div>
                <button className="w-full text-[#C13B34] font-semibold text-sm flex items-center justify-center gap-2" type="button" onClick={onLeaveChat}>
                  <span className="material-symbols-outlined text-base">delete</span>
                  销毁对话
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function MobileDiscoverScreen({
  peers,
  selectedPeerId,
  connectionLabel,
  onSelectPeer,
  onStartSelected,
  onOpenChat,
  hasActiveChat,
  onPlaceholder
}) {
  return (
    <div className="lg:hidden bg-background font-body text-on-surface antialiased min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-[#f8fafb]/70 backdrop-blur-[20px] flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#78909C]">bubble_chart</span>
          <h1 className="font-bold text-[#2a3437] tracking-tighter text-xl">Whisper</h1>
        </div>
        <button className="flex items-center" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.notifications)}>
          <span className="material-symbols-outlined text-[#78909C]">notifications</span>
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-md mx-auto min-h-screen">
        <section className="mb-10">
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-2">发现共鸣</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="font-label text-sm text-on-surface-variant font-medium">
              {peers.length} 位灵魂在线 · {connectionLabel}
            </span>
          </div>
        </section>

        <div className="space-y-6">
          {peers.length === 0 ? (
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-3">hourglass_top</span>
              <p>还没有新的访客出现。</p>
            </div>
          ) : (
            peers.map((peer) => {
              const mood = getMoodOption(peer.mood);
              const selected = selectedPeerId === peer.id;

              return (
                <button
                  key={peer.id}
                  className={cx(
                    "bg-surface-container-lowest p-5 rounded-[2rem] flex items-center gap-5 transition-transform active:scale-95 duration-200 w-full text-left border",
                    selected ? "border-primary/30 shadow-lg shadow-primary/10" : "border-transparent"
                  )}
                  type="button"
                  onClick={() => onSelectPeer(peer.id)}
                >
                  <div className={cx("w-14 h-14 rounded-full flex-shrink-0 bg-gradient-to-tr relative", mood.chipClass)}>
                    <div className="absolute inset-0.5 bg-surface-container-lowest rounded-full flex items-center justify-center overflow-hidden">
                      <img alt={peer.codename} className="w-full h-full object-cover" src={getPeerAvatar(peer.id)} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1 gap-3">
                      <h3 className="font-headline font-bold text-on-surface truncate">{peer.codename}</h3>
                      <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                        {formatMobilePresence(peer.connectedAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mood.mobileTags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-surface-container rounded-full font-label text-[11px] text-on-surface-variant">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            className="px-10 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-base shadow-[0_8px_30px_rgba(72,98,110,0.2)] active:scale-95 transition-transform duration-200 disabled:opacity-40"
            type="button"
            disabled={!selectedPeerId}
            onClick={onStartSelected}
          >
            开启私语
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-8 pb-6 pt-4 bg-[#f8fafb] rounded-t-[2rem] z-50 shadow-[0_-4px_40px_rgba(42,52,55,0.04)]">
        <button className="flex flex-col items-center justify-center text-[#2a3437] relative after:content-[''] after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-primary after:rounded-full transition-all duration-300 ease-out active:translate-y-[-2px]">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
            explore
          </span>
        </button>
        <button
          className="flex flex-col items-center justify-center text-[#566164] opacity-50 hover:opacity-100 transition-all active:translate-y-[-2px] duration-300 ease-out disabled:opacity-20"
          type="button"
          disabled={!hasActiveChat}
          onClick={onOpenChat}
        >
          <span className="material-symbols-outlined text-2xl">chat_bubble</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#566164] opacity-50 hover:opacity-100 transition-all active:translate-y-[-2px] duration-300 ease-out" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.profile)}>
          <span className="material-symbols-outlined text-2xl">person</span>
        </button>
      </nav>
    </div>
  );
}

function MobileChatScreen({
  activeChat,
  draft,
  onDraftChange,
  onSubmit,
  onOpenDiscover,
  onPlaceholder,
  mobileFeedRef,
  mobileTextareaRef
}) {
  const messages = activeChat.messages;

  return (
    <div className="lg:hidden bg-surface font-body text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-[#f8fafb]/70 backdrop-blur-[20px] flex items-center justify-between px-6 h-16 w-full">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#78909C]">bubble_chart</span>
          <span className="font-bold text-[#2a3437] tracking-tighter text-xl">Whisper</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label text-[10px] uppercase tracking-widest text-primary-dim/60 font-semibold">
            Status
          </span>
          <span className="text-sm font-medium text-primary-dim italic animate-pulse">
            {activeChat.peerTyping ? "对方正在输入..." : "Secure relay"}
          </span>
        </div>
      </header>

      <main ref={mobileFeedRef} className="pt-20 pb-40 px-6 min-h-screen flex flex-col gap-8 max-w-2xl mx-auto overflow-y-auto hide-scrollbar">
        <div className="flex justify-center my-4">
          <span className="font-label text-[11px] text-on-surface-variant/40 tracking-[0.2em] uppercase">Today</span>
        </div>

        {messages.length === 0 ? (
          <div className="flex justify-center mt-4">
            <div className="bg-tertiary-container/30 px-4 py-1.5 rounded-full">
              <span className="font-label text-[10px] text-on-tertiary-container font-medium tracking-wide">
                Secure connection established
              </span>
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => {
          if (message.kind === "system") {
            return (
              <div key={message.id} className="flex justify-center mt-4">
                <div className="bg-tertiary-container/30 px-4 py-1.5 rounded-full">
                  <span className="font-label text-[10px] text-on-tertiary-container font-medium tracking-wide">
                    {message.text}
                  </span>
                </div>
              </div>
            );
          }

          if (message.kind === "peer") {
            const previousKind = messages[index - 1]?.kind;

            return (
              <div key={message.id} className="flex flex-col gap-1 items-start max-w-[85%]">
                {previousKind !== "peer" ? (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-tertiary-container text-sm">person</span>
                    </div>
                    <span className="font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                      Stranger
                    </span>
                  </div>
                ) : null}
                <div className="bg-secondary-container text-on-surface p-4 rounded-lg rounded-tl-none shadow-sm">
                  <p className="leading-relaxed">{message.text}</p>
                </div>
                <span className="font-label text-[10px] text-on-surface-variant mt-1 ml-1 opacity-50">
                  {formatClock(message.sentAt)}
                </span>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex flex-col gap-1 items-end ml-auto max-w-[85%]">
              <div className="bg-primary-container text-on-primary-container p-4 rounded-lg rounded-tr-none shadow-sm">
                <p className="leading-relaxed">{message.text}</p>
              </div>
              <span className="font-label text-[10px] text-on-surface-variant mt-1 mr-1 opacity-50">
                {formatClock(message.sentAt)} · Read
              </span>
            </div>
          );
        })}
      </main>

      <div className="fixed bottom-24 left-0 w-full px-6 z-40">
        <form className="max-w-2xl mx-auto flex items-end gap-3 p-2 bg-surface-container-lowest/80 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(42,52,55,0.08)] border border-outline-variant/10" onSubmit={onSubmit}>
          <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors shrink-0" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.help)}>
            <span className="material-symbols-outlined text-outline">add</span>
          </button>
          <div className="flex-1 pb-1">
            <textarea
              ref={mobileTextareaRef}
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder-outline-variant/60 font-body text-base py-3 resize-none hide-scrollbar"
              placeholder="Whisper something..."
              rows={1}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value, event.target)}
            />
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors shrink-0" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.help)}>
            <span className="material-symbols-outlined text-outline">sentiment_satisfied</span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 shrink-0 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
              send
            </span>
          </button>
        </form>
      </div>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-8 pb-6 pt-4 bg-[#f8fafb] rounded-t-[2rem] z-50 shadow-[0_-4px_40px_rgba(42,52,55,0.04)]">
        <button className="flex flex-col items-center justify-center text-[#566164] opacity-50 hover:opacity-100 transition-all active:translate-y-[-2px] duration-300 ease-out h-12 w-12" type="button" onClick={onOpenDiscover}>
          <span className="material-symbols-outlined">explore</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#2a3437] relative after:content-[''] after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-primary after:rounded-full hover:opacity-100 transition-all active:translate-y-[-2px] duration-300 ease-out h-12 w-12">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
            chat_bubble
          </span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#566164] opacity-50 hover:opacity-100 transition-all active:translate-y-[-2px] duration-300 ease-out h-12 w-12" type="button" onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.profile)}>
          <span className="material-symbols-outlined">person</span>
        </button>
      </nav>
    </div>
  );
}

export function AnonymousChatApp() {
  const [screen, setScreen] = useState("entry");
  const [connectionState, setConnectionState] = useState("idle");
  const [profile, setProfile] = useState({ codename: "", mood: "calm" });
  const [codenameDraft, setCodenameDraft] = useState("");
  const [peers, setPeers] = useState([]);
  const deferredPeers = useDeferredValue(peers);
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [toast, setToast] = useState("");

  const socketRef = useRef(null);
  const pendingProfileRef = useRef(null);
  const toastTimerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const desktopFeedRef = useRef(null);
  const mobileFeedRef = useRef(null);
  const desktopTextareaRef = useRef(null);
  const mobileTextareaRef = useRef(null);

  function showToast(message) {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 2400);
  }

  function resetToEntry(withToast) {
    setScreen("entry");
    setConnectionState("idle");
    setPeers([]);
    setSelectedPeerId("");
    setActiveChat(null);
    setMessageDraft("");
    setProfile({ codename: "", mood: "calm" });
    setCodenameDraft("");
    socketRef.current = null;

    if (withToast) {
      showToast(withToast);
    }
  }

  function resizeTextarea(target) {
    if (!target) {
      return;
    }

    target.style.height = "0px";
    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
  }

  function clearTextareaHeights() {
    if (desktopTextareaRef.current) {
      desktopTextareaRef.current.style.height = "";
    }

    if (mobileTextareaRef.current) {
      mobileTextareaRef.current.style.height = "";
    }
  }

  function emit(payload) {
    if (!socketRef.current?.connected) {
      showToast("连接尚未建立，请稍后重试。");
      return false;
    }

    socketRef.current.emit("client-event", payload);
    return true;
  }

  function connectAndRegister(nextProfile) {
    pendingProfileRef.current = nextProfile;

    if (socketRef.current?.connected) {
      emit({ type: "register", profile: nextProfile });
      return;
    }

    if (!socketRef.current) {
      const socket = io({
        transports: ["websocket"],
        autoConnect: false,
        reconnection: false
      });

      socket.on("connect", () => {
        setConnectionState("connected");

        if (pendingProfileRef.current) {
          socket.emit("client-event", {
            type: "register",
            profile: pendingProfileRef.current
          });
        }
      });

      socket.on("disconnect", () => {
        resetToEntry("连接已断开，当前临时会话已清空。");
      });

      socket.on("server-event", (payload) => {
        switch (payload.type) {
          case "session-ready":
            return;

          case "registered":
            startTransition(() => {
              setProfile({
                codename: payload.self.codename,
                mood: payload.self.mood
              });
              setScreen("discover");
            });
            showToast("匿名身份已建立。");
            return;

          case "presence":
            startTransition(() => {
              setPeers(payload.peers);
              setSelectedPeerId((current) =>
                payload.peers.some((peer) => peer.id === current) ? current : ""
              );
            });
            return;

          case "chat-started":
            startTransition(() => {
              setActiveChat({
                roomId: payload.roomId,
                peer: payload.peer,
                startedAt: payload.startedAt,
                peerTyping: false,
                messages: []
              });
              setScreen("chat");
              setSelectedPeerId("");
              setMessageDraft("");
            });
            clearTextareaHeights();
            return;

          case "message":
            setActiveChat((current) => {
              if (!current || current.roomId !== payload.roomId) {
                return current;
              }

              return {
                ...current,
                peerTyping: false,
                messages: [
                  ...current.messages,
                  {
                    id: payload.message.id,
                    kind: "peer",
                    text: payload.message.text,
                    sentAt: payload.message.sentAt
                  }
                ]
              };
            });
            return;

          case "typing":
            setActiveChat((current) => {
              if (!current || current.roomId !== payload.roomId) {
                return current;
              }

              return {
                ...current,
                peerTyping: payload.isTyping
              };
            });
            return;

          case "chat-ended":
            startTransition(() => {
              setActiveChat(null);
              setScreen("discover");
              setMessageDraft("");
            });
            clearTextareaHeights();
            showToast(payload.reason === "partner-disconnected" ? "对方已离线，对话已释放。" : "对话已销毁。");
            return;

          case "error":
            showToast(payload.message);
            return;

          default:
            return;
        }
      });

      socketRef.current = socket;
    }

    setConnectionState("connecting");
    socketRef.current.connect();
  }

  function handleEnter(event) {
    event.preventDefault();

    const nextProfile = {
      codename: codenameDraft.trim() || "匿名访客",
      mood: profile.mood
    };

    setProfile(nextProfile);
    connectAndRegister(nextProfile);
  }

  function handleStartChat(peerId) {
    emit({ type: "start-chat", peerId });
  }

  function handleStartSelected() {
    if (!selectedPeerId) {
      showToast("请先选择一位匿名访客。");
      return;
    }

    handleStartChat(selectedPeerId);
  }

  function handleLeaveChat() {
    emit({ type: "leave-chat" });
  }

  function handleNewDialogue() {
    if (activeChat) {
      handleLeaveChat();
      return;
    }

    setScreen("discover");
  }

  function handleDraftChange(nextValue, target) {
    setMessageDraft(nextValue);
    resizeTextarea(target);

    if (!activeChat) {
      return;
    }

    emit({ type: "typing", isTyping: nextValue.trim().length > 0 });
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      emit({ type: "typing", isTyping: false });
    }, 900);
  }

  function handleSend(event) {
    event.preventDefault();

    const text = messageDraft.trim();

    if (!text || !activeChat) {
      return;
    }

    setActiveChat((current) => ({
      ...current,
      messages: [
        ...current.messages,
        {
          id: crypto.randomUUID(),
          kind: "self",
          text,
          sentAt: new Date().toISOString()
        }
      ]
    }));
    setMessageDraft("");
    clearTextareaHeights();
    emit({ type: "typing", isTyping: false });
    window.clearTimeout(typingTimerRef.current);
    emit({ type: "message", text });
  }

  useEffect(() => {
    const desktopFeed = desktopFeedRef.current;
    const mobileFeed = mobileFeedRef.current;

    if (desktopFeed) {
      desktopFeed.scrollTop = desktopFeed.scrollHeight;
    }

    if (mobileFeed) {
      mobileFeed.scrollTop = mobileFeed.scrollHeight;
    }
  }, [activeChat]);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
      window.clearTimeout(typingTimerRef.current);
      socketRef.current?.disconnect();
    };
  }, []);

  const connectionLabel = getConnectionLabel(connectionState);

  return (
    <>
      <Toast message={toast} />

      {screen === "entry" ? (
        <>
          <DesktopEntryScreen
            codename={codenameDraft}
            mood={profile.mood}
            onCodenameChange={setCodenameDraft}
            onMoodChange={(mood) => setProfile((current) => ({ ...current, mood }))}
            onSubmit={handleEnter}
            onPlaceholder={showToast}
          />
          <MobileEntryScreen
            codename={codenameDraft}
            mood={profile.mood}
            onCodenameChange={setCodenameDraft}
            onMoodChange={(mood) => setProfile((current) => ({ ...current, mood }))}
            onSubmit={handleEnter}
          />
        </>
      ) : null}

      {screen === "discover" ? (
        <>
          <DesktopDiscoverScreen
            codename={profile.codename}
            peers={deferredPeers}
            onNewDialogue={handleNewDialogue}
            onPlaceholder={showToast}
            onStartChat={handleStartChat}
          />
          <MobileDiscoverScreen
            peers={deferredPeers}
            selectedPeerId={selectedPeerId}
            connectionLabel={connectionLabel}
            onSelectPeer={setSelectedPeerId}
            onStartSelected={handleStartSelected}
            onOpenChat={() => (activeChat ? setScreen("chat") : showToast("当前没有正在进行的会话。"))}
            hasActiveChat={Boolean(activeChat)}
            onPlaceholder={showToast}
          />
        </>
      ) : null}

      {screen === "chat" && activeChat ? (
        <>
          <DesktopChatScreen
            codename={profile.codename}
            activeChat={activeChat}
            draft={messageDraft}
            onDraftChange={handleDraftChange}
            onSubmit={handleSend}
            onLeaveChat={handleLeaveChat}
            onNewDialogue={handleNewDialogue}
            onPlaceholder={showToast}
            desktopFeedRef={desktopFeedRef}
            desktopTextareaRef={desktopTextareaRef}
          />
          <MobileChatScreen
            activeChat={activeChat}
            draft={messageDraft}
            onDraftChange={handleDraftChange}
            onSubmit={handleSend}
            onOpenDiscover={() => setScreen("discover")}
            onPlaceholder={showToast}
            mobileFeedRef={mobileFeedRef}
            mobileTextareaRef={mobileTextareaRef}
          />
        </>
      ) : null}
    </>
  );
}
