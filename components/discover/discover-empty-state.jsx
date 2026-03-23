import { LoaderCircle } from "lucide-react";

export function DiscoverEmptyState() {
  return (
    <section className="rounded-[2rem] bg-surface-container-lowest p-10 text-center shadow-ambient lg:rounded-[3rem] lg:p-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-container/40 lg:h-16 lg:w-16">
        <LoaderCircle
          className="h-6 w-6 animate-spin text-on-tertiary-container"
          strokeWidth={1.8}
        />
      </div>
      <h3 className="mt-6 text-xl font-bold text-on-surface lg:text-2xl">
        正在等待新的匿名访客
      </h3>
      <p className="mx-auto mt-3 max-w-xl leading-relaxed text-on-surface-variant">
        当前没有可匹配的在线对象。这里不会保存任何用户信息，新的会话进入后会实时出现在列表中。
      </p>
    </section>
  );
}
