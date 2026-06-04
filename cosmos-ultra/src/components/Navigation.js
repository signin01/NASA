import { SECTION_LINKS, APP_VERSION } from "../core/constants.js";
import { state } from "../core/state.js";
import { router } from "../core/router.js";

export class Navigation {
  constructor(container) {
    this.container = container;
    this.clockTimer = null;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="nav-inner">
        <button class="nav-logo" type="button" data-go="hero" aria-label="Go to mission control">
          <span class="logo-orbit" aria-hidden="true"></span>
          <span class="logo-text">COSMOS</span>
          <span class="version">v${APP_VERSION}</span>
        </button>

        <nav class="nav-links" aria-label="COSMOS sections">
          ${SECTION_LINKS.map(([id, label]) => `
            <button class="nav-link" type="button" data-go="${id}">${label}</button>
          `).join("")}
        </nav>

        <div class="nav-tools">
          <div class="utc-clock">
            <span class="live-dot"></span>
            <strong id="utc-time">--:--:--</strong>
            <small id="utc-date">UTC</small>
          </div>
          <button class="icon-button" type="button" id="command-open" aria-label="Open command palette">⌘</button>
          <button class="icon-button" type="button" id="settings-open" aria-label="Open settings">⚙</button>
        </div>
      </div>

      <div id="command-palette" class="command-palette" aria-hidden="true">
        <div class="command-box">
          <input id="command-input" type="search" placeholder="Search sections..." aria-label="Search sections" />
          <div id="command-results" class="command-results"></div>
        </div>
      </div>
    `;

    this.bind();
    this.startClock();
    this.renderActive(state.get("ui.currentSection"));

    state.subscribe("ui.currentSection", (id) => this.renderActive(id));
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      const goButton = event.target.closest("[data-go]");
      if (goButton) {
        router.go(goButton.dataset.go);
      }

      if (event.target.closest("#command-open")) {
        this.openCommandPalette();
      }

      if (event.target.closest("#settings-open")) {
        router.go("settings");
        state.set("ui.isSettingsOpen", true);
      }
    });

    const palette = this.container.querySelector("#command-palette");
    const input = this.container.querySelector("#command-input");
    const results = this.container.querySelector("#command-results");

    input.addEventListener("input", () => {
      this.renderCommandResults(input.value, results);
    });

    palette.addEventListener("click", (event) => {
      if (event.target === palette) this.closeCommandPalette();

      const button = event.target.closest("[data-command]");
      if (button) {
        router.go(button.dataset.command);
        this.closeCommandPalette();
      }
    });

    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        this.openCommandPalette();
      }

      if (event.key === "Escape") {
        this.closeCommandPalette();
      }
    });
  }

  startClock() {
    const time = this.container.querySelector("#utc-time");
    const date = this.container.querySelector("#utc-date");

    const update = () => {
      const now = new Date();
      time.textContent = now.toISOString().slice(11, 23).replace("Z", "");
      date.textContent = now.toUTCString().slice(0, 16);
    };

    update();
    this.clockTimer = setInterval(update, 100);
  }

  renderActive(sectionId) {
    this.container.querySelectorAll(".nav-link").forEach((button) => {
      button.classList.toggle("active", button.dataset.go === sectionId);
    });
  }

  openCommandPalette() {
    const palette = this.container.querySelector("#command-palette");
    const input = this.container.querySelector("#command-input");
    const results = this.container.querySelector("#command-results");

    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    this.renderCommandResults("", results);
    setTimeout(() => input.focus(), 30);
  }

  closeCommandPalette() {
    const palette = this.container.querySelector("#command-palette");
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
  }

  renderCommandResults(query, target) {
    const normalized = query.trim().toLowerCase();
    const matches = SECTION_LINKS.filter(([id, label]) => {
      return id.includes(normalized) || label.toLowerCase().includes(normalized);
    });

    target.innerHTML = matches.map(([id, label]) => `
      <button class="command-result" type="button" data-command="${id}">
        <span>${label}</span>
        <small>#${id}</small>
      </button>
    `).join("");
  }

  destroy() {
    clearInterval(this.clockTimer);
  }
}
