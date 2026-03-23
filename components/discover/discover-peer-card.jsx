import { ArrowRight } from "lucide-react";

import { AvatarImage } from "../avatar-image.jsx";
import { cx } from "../../lib/cx.js";

export function DiscoverPeerCard({
  mood,
  peer,
  selected,
  onSelect,
  onStartChat,
  presenceLabel,
}) {
  return (
    <article
      className={cx(
        "group relative flex flex-col rounded-[2rem] border border-slate-50 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:rounded-[3rem] lg:p-8",
        selected && "ring-2 ring-primary/20",
      )}
    >
      <button
        className="absolute inset-0 rounded-[inherit] lg:hidden"
        type="button"
        onClick={onSelect}
      >
        <span className="sr-only">选择 {peer.codename}</span>
      </button>

      <div className="relative mb-6 self-start lg:mb-8 lg:self-center">
        <AvatarImage
          alt={peer.codename}
          className="h-16 w-16 lg:h-20 lg:w-20"
          imageClassName="border-[3px] border-white"
          sizes="80px"
          src={peer.avatar}
        />
        <div className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-400" />
      </div>

      <div className="space-y-3 lg:text-center">
        <div>
          <h3 className="truncate text-xl font-bold text-slate-900 lg:text-2xl">
            {peer.codename}
          </h3>
          <p className="font-label text-[11px] tracking-wide text-slate-400 lg:text-sm">
            {presenceLabel}
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
            : "bg-surface-container-highest text-slate-600 hover:bg-slate-200",
        )}
        type="button"
        onClick={onStartChat}
      >
        <span className="ml-2 text-sm tracking-wide">开启私语</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </article>
  );
}
