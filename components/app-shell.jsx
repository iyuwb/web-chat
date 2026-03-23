"use client";

import { ChatScreen } from "./chat-screen.jsx";
import { DiscoverScreen } from "./discover-screen.jsx";
import { EntryScreen } from "./entry-screen.jsx";
import { useChat } from "./chat-provider.jsx";

export function AppShell() {
  const { activeView } = useChat();

  switch (activeView) {
    case "discover":
      return <DiscoverScreen />;
    case "chat":
      return <ChatScreen />;
    default:
      return <EntryScreen />;
  }
}
