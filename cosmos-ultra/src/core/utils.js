export function formatNumber(value, options = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat(undefined, options).format(number);
}

export function formatDate(value, options = {}) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options
  }).format(date);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

export function debounce(callback, delay = 300) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

export function throttleRaf(callback) {
  let frame = null;
  let latestArgs = null;

  return (...args) => {
    latestArgs = args;
    if (frame) return;

    frame = requestAnimationFrame(() => {
      callback(...latestArgs);
      frame = null;
    });
  };
}

export function html(strings, ...values) {
  return strings.reduce((result, string, index) => {
    const value = values[index] ?? "";
    return result + string + value;
  }, "");
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function kmToMiles(km) {
  return Number(km) * 0.621371;
}

export function celsiusToFahrenheit(celsius) {
  return Number(celsius) * 1.8 + 32;
}

export function todayISO(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function getNestedValue(obj, path, fallback = null) {
  const value = path.split(".").reduce((current, key) => current?.[key], obj);
  return value ?? fallback;
}

export function createSectionTitle(kicker, title) {
  return `
    <div class="section-heading">
      <p class="section-kicker">${kicker}</p>
      <h2 class="section-title">${title}</h2>
    </div>
  `;
}

export function createHudCard(label, value, unit = "", key = "") {
  return `
    <article class="hud-panel corner-decoration" data-key="${key}">
      <span class="hud-label">${label}</span>
      <strong class="hud-value">${value}</strong>
      <span class="hud-unit">${unit}</span>
    </article>
  `;
}

export function showToast(message, type = "info") {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  root.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 20);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 260);
  }, 4200);
}
