"use client";

export default function Error({ reset }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg rounded-[2rem] bg-surface-container-lowest p-10 text-center shadow-ambient">
        <p className="font-label text-xs uppercase tracking-[0.3em] text-on-surface-variant">
          Runtime Error
        </p>
        <h1 className="mt-4 font-headline text-3xl font-extrabold text-on-surface">
          页面暂时不可用
        </h1>
        <p className="mt-4 leading-7 text-on-surface-variant">
          出现了一个临时异常。重试不会影响已建立的匿名约束。
        </p>
        <button
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary"
          type="button"
          onClick={reset}
        >
          重新加载
        </button>
      </div>
    </main>
  );
}
