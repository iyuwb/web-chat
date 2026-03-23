import { Shield, UserRound } from "lucide-react";

export function ChatFeed({ activeChat, feedRef, formatClock }) {
  return (
    <div
      ref={feedRef}
      className="hide-scrollbar flex min-h-screen flex-1 flex-col gap-8 overflow-y-auto px-6 pb-48 pt-24 lg:min-h-0 lg:px-8 lg:pb-8 lg:pt-8"
    >
      <div className="my-2 flex justify-center lg:my-0">
        <span className="font-label text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/40">
          Today
        </span>
      </div>

      {activeChat.messages.length === 0 ? (
        <>
          <div className="flex justify-center">
            <div className="rounded-full bg-tertiary-container/30 px-4 py-1.5">
              <span className="font-label text-[10px] font-medium tracking-wide text-on-tertiary-container">
                Secure connection established
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center py-10 opacity-50">
            <Shield className="mb-3 h-8 w-8 text-primary" strokeWidth={1.7} />
            <p className="font-headline text-lg italic text-on-surface">
              对话从这里开始
            </p>
          </div>
        </>
      ) : null}

      {activeChat.messages.map((message, index) => {
        if (message.kind === "system") {
          return (
            <div key={message.id} className="flex justify-center">
              <div className="rounded-full bg-tertiary-container/30 px-4 py-1.5">
                <span className="font-label text-[10px] font-medium tracking-wide text-on-tertiary-container">
                  {message.text}
                </span>
              </div>
            </div>
          );
        }

        if (message.kind === "peer") {
          const showIdentity = activeChat.messages[index - 1]?.kind !== "peer";

          return (
            <div key={message.id} className="flex max-w-[85%] flex-col gap-1">
              {showIdentity ? (
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-container">
                    <UserRound
                      className="h-4 w-4 text-on-tertiary-container"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Stranger
                  </span>
                </div>
              ) : null}
              <div className="rounded-lg rounded-tl-none bg-secondary-container p-4 text-on-surface shadow-sm lg:px-6 lg:py-4 lg:rounded-[1.5rem] lg:rounded-bl-[0.5rem]">
                <p className="leading-relaxed">{message.text}</p>
              </div>
              <span className="ml-1 mt-1 font-label text-[10px] text-on-surface-variant/70">
                {formatClock(message.sentAt)}
              </span>
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className="ml-auto flex max-w-[85%] flex-col items-end gap-1"
          >
            <div className="rounded-lg rounded-tr-none bg-primary-container p-4 text-on-primary-container shadow-sm lg:px-6 lg:py-4 lg:rounded-[1.5rem] lg:rounded-br-[0.5rem]">
              <p className="leading-relaxed">{message.text}</p>
            </div>
            <span className="mr-1 mt-1 font-label text-[10px] text-on-surface-variant/70">
              {formatClock(message.sentAt)} · Read
            </span>
          </div>
        );
      })}
    </div>
  );
}
