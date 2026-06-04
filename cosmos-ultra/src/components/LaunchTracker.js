import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createSectionTitle, escapeHtml, formatDate } from "../core/utils.js";

export class LaunchTracker {
  constructor(container) {
    this.container = container;
    this.timer = null;
    this.nextLaunch = null;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("LIFTOFF SCHEDULE", "Launch Tracker")}

      <div class="launch-feature">
        <div>
          <p class="section-kicker">NEXT LAUNCH</p>
          <h3 id="next-launch-name">Awaiting launch manifest...</h3>
          <p id="next-launch-meta">—</p>
        </div>
        <div class="countdown" id="launch-countdown">
          <span>--</span><span>--</span><span>--</span><span>--</span>
        </div>
      </div>

      <div id="launch-grid" class="card-grid">
        ${Array.from({ length: 6 }, () => `<div class="mission-card skeleton-card"></div>`).join("")}
      </div>
    `;

    this.load();
  }

  async load() {
    const grid = this.container.querySelector("#launch-grid");

    try {
      const { data } = await api.getUpcomingLaunches(12);
      const launches = data.results || [];
      state.set("data.launches", launches);

      this.nextLaunch = launches[0] || null;
      this.renderNext();

      grid.innerHTML = launches.map((launch) => `
        <article class="mission-card">
          ${launch.image ? `<img src="${launch.image}" alt="${escapeHtml(launch.name)}" loading="lazy" />` : ""}
          <div>
            <p class="section-kicker">${escapeHtml(launch.status?.name || "Scheduled")}</p>
            <h3>${escapeHtml(launch.name)}</h3>
            <p>${formatDate(launch.net)}</p>
            <small>${escapeHtml(launch.pad?.location?.name || "Location pending")}</small>
          </div>
        </article>
      `).join("");

      this.timer = setInterval(() => this.renderCountdown(), 1000);
      this.renderCountdown();
    } catch (error) {
      grid.innerHTML = `<div class="signal-lost">Launch manifest unavailable.</div>`;
      state.addError("Launch Tracker", error);
    }
  }

  renderNext() {
    if (!this.nextLaunch) return;

    this.container.querySelector("#next-launch-name").textContent = this.nextLaunch.name;
    this.container.querySelector("#next-launch-meta").textContent = `${formatDate(this.nextLaunch.net)} · ${this.nextLaunch.pad?.location?.name || "Location pending"}`;
  }

  renderCountdown() {
    if (!this.nextLaunch) return;

    const target = new Date(this.nextLaunch.net).getTime();
    const diff = Math.max(0, target - Date.now());

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const minutes = Math.floor(diff / 60000) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    const values = [days, hours, minutes, seconds].map((value) => String(value).padStart(2, "0"));
    this.container.querySelector("#launch-countdown").innerHTML = values
      .map((value, index) => `<span><strong>${value}</strong><small>${["D", "H", "M", "S"][index]}</small></span>`)
      .join("");
  }

  destroy() {
    clearInterval(this.timer);
  }
}
