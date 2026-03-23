export const initialChatState = {
  sessionId: "",
  self: null,
  peers: [],
  activeChat: null,
  connectionState: "idle",
};

export function chatReducer(state, action) {
  switch (action.type) {
    case "session-created":
      return {
        ...state,
        sessionId: action.payload.sessionId,
        self: action.payload.self,
        peers: action.payload.peers,
        activeChat: null,
        connectionState: "connecting",
      };

    case "connection-state":
      return {
        ...state,
        connectionState: action.value,
      };

    case "presence":
      return {
        ...state,
        peers: action.peers,
      };

    case "chat-started":
      return {
        ...state,
        activeChat: {
          roomId: action.payload.roomId,
          peer: action.payload.peer,
          startedAt: action.payload.startedAt,
          peerTyping: false,
          messages: [],
        },
      };

    case "self-message":
      if (!state.activeChat) {
        return state;
      }

      return {
        ...state,
        activeChat: {
          ...state.activeChat,
          peerTyping: false,
          messages: [...state.activeChat.messages, action.message],
        },
      };

    case "peer-message":
      if (
        !state.activeChat ||
        state.activeChat.roomId !== action.payload.roomId
      ) {
        return state;
      }

      return {
        ...state,
        activeChat: {
          ...state.activeChat,
          peerTyping: false,
          messages: [...state.activeChat.messages, action.payload.message],
        },
      };

    case "peer-typing":
      if (
        !state.activeChat ||
        state.activeChat.roomId !== action.payload.roomId
      ) {
        return state;
      }

      return {
        ...state,
        activeChat: {
          ...state.activeChat,
          peerTyping: action.payload.isTyping,
        },
      };

    case "chat-ended":
      return {
        ...state,
        activeChat: null,
      };

    case "session-reset":
      return initialChatState;

    default:
      return state;
  }
}
