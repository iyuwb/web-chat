import { Trash2 } from "lucide-react";

import { AvatarImage } from "../avatar-image.jsx";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <span className="block text-xl font-bold">{value}</span>
      <span className="text-[10px] uppercase text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

export function ChatSidebar({ activeChat, onLeaveChat, peerAvatar, stats }) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-white/10 bg-surface-container-low p-8 lg:flex">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 rounded-full bg-gradient-to-tr from-primary-fixed to-tertiary-fixed p-1 shadow-xl shadow-primary/10">
          <AvatarImage
            alt={activeChat.peer.codename}
            className="h-24 w-24"
            sizes="96px"
            src={peerAvatar}
          />
        </div>
        <h3 className="font-headline text-lg font-bold">
          {activeChat.peer.codename}
        </h3>
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
          onClick={onLeaveChat}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.9} />
          销毁对话
        </button>
      </div>
    </aside>
  );
}
