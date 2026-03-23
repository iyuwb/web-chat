"use client";

import {
  Archive,
  Circle,
  Cloud,
  Compass,
  Fingerprint,
  MessageCircleMore,
  MoonStar,
  Plus,
  Sparkles,
  UserRound,
  Waves,
} from "lucide-react";

import { AvatarImage } from "./avatar-image.jsx";
import {
  CURRENT_USER_AVATAR,
  PLACEHOLDER_ACTIONS,
} from "../lib/chat-ui-data.js";
import { cx } from "../lib/cx.js";

const MOOD_ICON_BY_NAME = {
  sparkles: Sparkles,
  waves: Waves,
  circle: Circle,
  cloud: Cloud,
};

export function MoodGlyph({ name, className }) {
  const Icon = MOOD_ICON_BY_NAME[name] ?? Sparkles;

  return <Icon className={className} strokeWidth={1.9} />;
}

export function DesktopSidebar({ codename, onRestart, onPlaceholder }) {
  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col bg-slate-50 py-8 shadow-[40px_0_60px_-15px_rgba(42,52,55,0.05)] lg:flex">
      <div className="mb-10 px-8">
        <div className="mb-8 flex items-center space-x-3">
          <div className="rounded-full bg-gradient-to-tr from-primary to-primary-fixed-dim p-0.5">
            <AvatarImage
              alt={`${codename || "匿名访客"} avatar`}
              className="h-12 w-12 border-2 border-white"
              priority
              sizes="48px"
              src={CURRENT_USER_AVATAR}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-on-surface">
              {codename || "The Seeker"}
            </h3>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
              Status: Ghost
            </p>
          </div>
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          type="button"
          onClick={onRestart}
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          <span>New Dialogue</span>
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        <button
          className="mx-4 flex w-[calc(100%-2rem)] items-center gap-4 rounded-full bg-blue-50 px-6 py-3 text-left font-medium text-blue-600"
          type="button"
        >
          <Waves className="h-5 w-5" strokeWidth={2} />
          <span className="text-sm font-medium">发现共鸣</span>
        </button>
        <ChromeNavButton
          icon={Archive}
          label="归档记录"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.archive)}
        />
        <ChromeNavButton
          icon={Sparkles}
          label="我的回响"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.echoes)}
        />
        <ChromeNavButton
          icon={Fingerprint}
          label="Profile"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.profile)}
        />
      </nav>

      <div className="mt-auto border-t border-surface-container/50 px-8 pt-8">
        <button
          className="flex w-full items-center justify-between rounded-[1.75rem] bg-surface-container-low px-4 py-4"
          type="button"
          onClick={() => onPlaceholder(PLACEHOLDER_ACTIONS.theme)}
        >
          <MoonStar className="h-5 w-5 text-primary" strokeWidth={1.9} />
          <div className="relative h-5 w-10 rounded-full bg-outline-variant/30">
            <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white"></div>
          </div>
        </button>
      </div>
    </aside>
  );
}

function ChromeNavButton({ icon: Icon, label, onClick }) {
  return (
    <button
      className="mx-4 flex w-[calc(100%-2rem)] items-center gap-4 rounded-full px-6 py-3 text-left text-slate-500 transition-colors hover:bg-slate-50"
      type="button"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export function MobileNav({
  active,
  hasActiveChat,
  onDiscover,
  onChat,
  onProfile,
}) {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-[2rem] bg-[#f8fafb] px-8 pb-6 pt-4 shadow-[0_-4px_40px_rgba(42,52,55,0.04)] lg:hidden">
      <MobileNavButton
        active={active === "discover"}
        icon={Compass}
        label="发现"
        onClick={onDiscover}
      />
      <MobileNavButton
        active={active === "chat"}
        disabled={!hasActiveChat}
        icon={MessageCircleMore}
        label="聊天"
        onClick={onChat}
      />
      <MobileNavButton
        active={false}
        icon={UserRound}
        label="档案"
        onClick={onProfile}
      />
    </nav>
  );
}

function MobileNavButton({
  active,
  disabled = false,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      className={cx(
        "relative flex h-12 w-12 flex-col items-center justify-center transition-all duration-300 ease-out active:-translate-y-[2px]",
        active
          ? "text-[#2a3437]"
          : "text-[#566164] opacity-50 hover:opacity-100",
        disabled && "opacity-20",
      )}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      <span className="sr-only">{label}</span>
      {active ? (
        <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"></span>
      ) : null}
    </button>
  );
}
