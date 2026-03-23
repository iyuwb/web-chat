export function formatRelativeTime(isoString) {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(isoString).getTime()) / 60_000),
  );

  if (minutes < 60) {
    return `活跃于 ${minutes} 分钟前`;
  }

  return `活跃于 ${Math.floor(minutes / 60)} 小时前`;
}

export function formatMobilePresence(isoString) {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(isoString).getTime()) / 60_000),
  );

  if (minutes < 2) {
    return "刚刚";
  }

  return `${minutes} 分钟前`;
}

export function formatClock(isoString) {
  return new Date(isoString).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function countVisibleChars(messages) {
  return messages.reduce((total, message) => {
    if (message.kind === "system") {
      return total;
    }

    return total + Array.from(message.text.replace(/\s+/g, "")).length;
  }, 0);
}
