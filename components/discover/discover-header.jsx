import {
  Bell,
  Fingerprint,
  Settings2,
} from "lucide-react";

export function DiscoverHeader({
  connectionLabel,
  onlineCount,
  onArchive,
  onEchoes,
  onFingerprint,
  onNotifications,
  onSettings,
}) {
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-[#f8fafb]/80 px-6 backdrop-blur-xl lg:border-b lg:border-slate-50 lg:bg-white">
        <div className="lg:hidden">
          <h1 className="font-headline text-base font-bold tracking-[0.08em] text-on-surface sm:text-lg">
            ETHEREAL WHISPER
          </h1>
          <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">
            {connectionLabel}
          </p>
        </div>

        <div className="hidden items-center space-x-12 lg:flex">
          <span className="text-xl font-bold tracking-[0.08em] text-slate-900 xl:text-2xl">
            ETHEREAL WHISPER
          </span>
          <nav className="flex h-full items-center space-x-8">
            <div className="relative flex h-full items-center">
              <button
                className="text-sm font-semibold text-cyan-600"
                type="button"
              >
                发现共鸣
              </button>
              <div className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-cyan-600" />
            </div>
            <button
              className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-800"
              type="button"
              onClick={onArchive}
            >
              归档记录
            </button>
            <button
              className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-800"
              type="button"
              onClick={onEchoes}
            >
              我的回响
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="hidden rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 lg:inline-flex"
            type="button"
            onClick={onSettings}
          >
            <Settings2 className="h-5 w-5" strokeWidth={1.9} />
          </button>
          <button
            className="hidden rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 lg:inline-flex"
            type="button"
            onClick={onFingerprint}
          >
            <Fingerprint className="h-5 w-5" strokeWidth={1.9} />
          </button>
          <button
            className="rounded-full p-2 text-[#78909C] transition-colors hover:bg-slate-50 lg:hidden"
            type="button"
            onClick={onNotifications}
          >
            <Bell className="h-5 w-5" strokeWidth={1.9} />
          </button>
        </div>
      </header>

      <section className="mb-10 lg:mb-12">
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface lg:text-5xl">
          发现共鸣
        </h2>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <p className="text-sm font-medium text-on-surface-variant lg:text-lg lg:font-light">
            当前在线的 {onlineCount} 位匿名旅人
          </p>
        </div>
      </section>
    </>
  );
}
