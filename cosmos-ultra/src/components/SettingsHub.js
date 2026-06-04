import { THEMES } from "../core/constants.js";
import { state } from "../core/state.js";
import { cache } from "../core/cache.js";
import { createSectionTitle } from "../core/utils.js";

export class SettingsHub {
  constructor(container) {
    this.container = container;
  }

  init() {
    if (!this.container) return;

    const settings = state.get("settings");

    this.container.innerHTML = `
      ${createSectionTitle("CONTROL HUB", "Settings & Control Hub")}

      <div class="settings-grid">
        <article class="side-panel">
          <h3>Appearance</h3>
          <div class="theme-grid">
            ${Object.entries(THEMES).map(([key, theme]) => `
              <button class="theme-swatch ${settings.theme === key ? "active" : ""}" type="button" data-theme-select="${key}">
                <span style="background:${theme.accent}"></span>
                ${theme.label}
              </button>
            `).join("")}
          </div>

          <label class="field-label">
            Font size
            <select id="font-size" class="select-control">
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="xl">XL</option>
            </select>
          </label>

          <label class="field-row">
            <input id="scanlines-toggle" type="checkbox" />
            Scanlines
          </label>
        </article>

        <article class="side-panel">
          <h3>Performance</h3>
          <label class="field-label">
            Star density
            <select id="star-density" class="select-control">
              <option value="500">500</option>
              <option value="1500">1500</option>
              <option value="3000">3000</option>
              <option value="5000">5000</option>
            </select>
          </label>

          <label class="field-label">
            Refresh interval
            <select id="refresh-interval" class="select-control">
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
            </select>
          </label>

          <label class="field-row">
            <input id="auto-refresh" type="checkbox" />
            Auto-refresh data
          </label>
        </article>

        <article class="side-panel">
          <h3>Data</h3>
          <label class="field-label">
            Units
            <select id="units" class="select-control">
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
              <option value="astronomical">Astronomical</option>
            </select>
          </label>

          <button class="chip" type="button" data-export-settings>Export Settings</button>
          <button class="chip" type="button" data-clear-cache>Clear API Cache</button>
          <button class="chip danger" type="button" data-reset-settings>Reset Settings</button>
        </article>
      </div>
    `;

    this.syncControls();
    this.bind();
  }

  syncControls() {
    const settings = state.get("settings");

    this.container.querySelector("#font-size").value = settings.fontSize;
    this.container.querySelector("#star-density").value = String(settings.starDensity);
    this.container.querySelector("#refresh-interval").value = String(settings.refreshInterval);
    this.container.querySelector("#units").value = settings.units;
    this.container.querySelector("#auto-refresh").checked = settings.autoRefresh;
    this.container.querySelector("#scanlines-toggle").checked = settings.scanlines;
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      const theme = event.target.closest("[data-theme-select]");
      if (theme) {
        state.set("settings.theme", theme.dataset.themeSelect);
        document.documentElement.dataset.theme = theme.dataset.themeSelect;
        this.container.querySelectorAll("[data-theme-select]").forEach((button) => button.classList.remove("active"));
        theme.classList.add("active");
      }

      if (event.target.closest("[data-export-settings]")) {
        const blob = new Blob([JSON.stringify(state.get("settings"), null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "cosmos-settings.json";
        link.click();
        URL.revokeObjectURL(link.href);
      }

      if (event.target.closest("[data-clear-cache]")) {
        cache.clear();
        alert("COSMOS API cache cleared.");
      }

      if (event.target.closest("[data-reset-settings]")) {
        localStorage.removeItem("cosmos_settings");
        location.reload();
      }
    });

    this.container.querySelector("#font-size").addEventListener("change", (event) => state.set("settings.fontSize", event.target.value));
    this.container.querySelector("#star-density").addEventListener("change", (event) => state.set("settings.starDensity", Number(event.target.value)));
    this.container.querySelector("#refresh-interval").addEventListener("change", (event) => state.set("settings.refreshInterval", Number(event.target.value)));
    this.container.querySelector("#units").addEventListener("change", (event) => state.set("settings.units", event.target.value));
    this.container.querySelector("#auto-refresh").addEventListener("change", (event) => state.set("settings.autoRefresh", event.target.checked));
    this.container.querySelector("#scanlines-toggle").addEventListener("change", (event) => {
      state.set("settings.scanlines", event.target.checked);
      document.body.classList.toggle("scanlines", event.target.checked);
    });
  }
}
