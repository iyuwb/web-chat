import { Plus, SendHorizontal, Smile } from "lucide-react";

export function ChatComposer({
  draft,
  textareaRef,
  onDraftChange,
  onHelp,
  onSubmit,
}) {
  return (
    <div className="fixed bottom-24 left-0 z-40 w-full px-6 lg:static lg:px-8 lg:pb-8">
      <form
        className="mx-auto flex max-w-3xl items-end gap-3 rounded-full border border-outline-variant/10 bg-surface-container-lowest/80 p-2 shadow-[0_8px_32px_rgba(42,52,55,0.08)] backdrop-blur-xl"
        onSubmit={onSubmit}
      >
        <button
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-container"
          type="button"
          onClick={onHelp}
        >
          <Plus className="h-5 w-5 text-outline" strokeWidth={2} />
        </button>

        <div className="flex-1 pb-1">
          <textarea
            ref={textareaRef}
            className="hide-scrollbar w-full resize-none border-none bg-transparent py-3 text-base text-on-surface placeholder:text-outline-variant/60 focus:ring-0"
            placeholder="说点什么..."
            rows={1}
            value={draft}
            onChange={onDraftChange}
          />
        </div>

        <button
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-container"
          type="button"
          onClick={onHelp}
        >
          <Smile className="h-5 w-5 text-outline" strokeWidth={1.9} />
        </button>

        <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95">
          <SendHorizontal className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </form>
    </div>
  );
}
