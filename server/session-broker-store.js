import { createSessionBroker } from "./session-broker.js";

const globalStore = globalThis;

export function getSessionBroker() {
  if (!globalStore.__simpleChatSessionBroker) {
    globalStore.__simpleChatSessionBroker = createSessionBroker();
  }

  return globalStore.__simpleChatSessionBroker;
}
