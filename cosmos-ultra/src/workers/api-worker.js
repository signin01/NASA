const DEFAULT_TIMEOUT = 9000;

async function fetchWithTimeout(url, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json,text/plain,*/*"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("json")
      ? await response.json()
      : await response.text();

    return data;
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener("message", async (event) => {
  const { id, url, timeout } = event.data || {};

  if (!id || !url) {
    self.postMessage({
      id,
      ok: false,
      error: "Worker request requires id and url."
    });
    return;
  }

  try {
    const data = await fetchWithTimeout(url, timeout);
    self.postMessage({
      id,
      ok: true,
      data
    });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error.message || String(error)
    });
  }
});
