import { MessageCircleMore } from "lucide-react";

export function ChatHeader({ peerTyping }) {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-[#f8fafb]/70 px-6 backdrop-blur-[20px] lg:static lg:border-b lg:border-white/10 lg:bg-white/70">
      <div className="flex items-center gap-3">
        <MessageCircleMore
          className="h-5 w-5 text-[#78909C]"
          strokeWidth={1.8}
        />
        <span className="font-headline text-base font-bold tracking-[0.08em] text-[#2a3437] sm:text-lg">
          ETHEREAL WHISPER
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="font-label text-[10px] font-semibold uppercase tracking-widest text-primary-dim/60">
          Status
        </span>
        <span className="text-sm font-medium italic text-primary-dim">
          {peerTyping ? "对方正在输入..." : "Secure relay"}
        </span>
      </div>
    </header>
  );
}
