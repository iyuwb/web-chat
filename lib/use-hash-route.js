import { useCallback, useEffect, useState } from "react";

import {
  getHashHref,
  parseHashRoute,
  resolveHashRoute,
} from "./hash-route.js";

export function useHashRoute({ hasSession, hasActiveChat }) {
  const [hashRoute, setHashRoute] = useState("entry");

  const writeHashUrl = useCallback((nextRoute, { replace = false } = {}) => {
    const normalizedRoute = parseHashRoute(getHashHref(nextRoute));

    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = `${window.location.pathname}${window.location.search}${getHashHref(normalizedRoute)}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentUrl === nextUrl) {
      return;
    }

    window.history[replace ? "replaceState" : "pushState"](null, "", nextUrl);
  }, []);

  const navigateTo = useCallback(
    (nextRoute, { replace = false } = {}) => {
      const normalizedRoute = parseHashRoute(getHashHref(nextRoute));
      setHashRoute(normalizedRoute);
      writeHashUrl(normalizedRoute, { replace });
    },
    [writeHashUrl],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleHashChange = () => {
      setHashRoute(parseHashRoute(window.location.hash));
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const activeView = resolveHashRoute(hashRoute, {
    hasSession,
    hasActiveChat,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash === getHashHref(activeView)) {
      return;
    }

    writeHashUrl(activeView, { replace: true });
  }, [activeView, writeHashUrl]);

  return {
    activeView,
    navigateTo,
  };
}
