const HASH_HREFS = {
  entry: "#/",
  discover: "#/discover",
  chat: "#/chat"
};

export function parseHashRoute(hash = "") {
  const fragment = `${hash}`.trim().replace(/^#/, "");
  const pathname = fragment ? `/${fragment.replace(/^\/+/, "")}` : "/";

  switch (pathname) {
    case "/discover":
      return "discover";
    case "/chat":
      return "chat";
    default:
      return "entry";
  }
}

export function resolveHashRoute(route, { hasSession, hasActiveChat }) {
  const requestedRoute = HASH_HREFS[route] ? route : "entry";

  if (!hasSession) {
    return "entry";
  }

  if (requestedRoute === "entry") {
    return hasActiveChat ? "chat" : "discover";
  }

  if (requestedRoute === "chat" && !hasActiveChat) {
    return "discover";
  }

  return requestedRoute;
}

export function getHashHref(route) {
  return HASH_HREFS[route] ?? HASH_HREFS.entry;
}
