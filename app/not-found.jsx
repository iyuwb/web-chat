import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg rounded-[2rem] bg-surface-container-lowest p-10 text-center shadow-ambient">
        <p className="font-label text-xs uppercase tracking-[0.3em] text-on-surface-variant">
          NotFound
        </p>
        <h1 className="mt-4 font-headline text-3xl font-extrabold text-on-surface">
          页面不存在
        </h1>
        <p className="mt-4 leading-7 text-on-surface-variant">
          当前地址没有可用内容。匿名会话入口仍然保留在首页。
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary"
          href="/"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
