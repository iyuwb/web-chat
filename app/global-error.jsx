"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="zh-CN">
      <body className="bg-background">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg rounded-[2rem] bg-surface-container-lowest p-10 text-center shadow-ambient">
            <p className="font-label text-xs uppercase tracking-[0.3em] text-on-surface-variant">
              Global Error
            </p>
            <h1 className="mt-4 font-headline text-3xl font-extrabold text-on-surface">
              应用加载失败
            </h1>
            <p className="mt-4 leading-7 text-on-surface-variant">
              根布局初始化时发生异常。可以直接重试恢复界面。
            </p>
            <button
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary"
              type="button"
              onClick={reset}
            >
              重试
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
