export async function requestJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "请求失败。");
  }

  return data;
}

export async function requestSessionSnapshot(sessionId) {
  const response = await fetch(
    `/api/session?sessionId=${encodeURIComponent(sessionId)}`,
    {
      cache: "no-store",
    },
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "请求失败。");
  }

  return data;
}
