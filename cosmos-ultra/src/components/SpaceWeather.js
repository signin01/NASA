import Chart from "chart.js/auto";
import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createHudCard, createSectionTitle, formatNumber } from "../core/utils.js";

export class SpaceWeather {
  constructor(container) {
    this.container = container;
    this.chart = null;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("HELIOPHYSICS", "Sun & Space Weather")}

      <div class="weather-grid">
        <div class="sun-visual" aria-label="Animated Sun">
          <div class="sun-core"></div>
          <div class="solar-corona"></div>
        </div>

        <div class="space-weather-hud">
          ${createHudCard("Current Kp", "—", "", "kp")}
          ${createHudCard("Solar Wind", "—", "km/s", "wind")}
          ${createHudCard("Density", "—", "p/cc", "density")}
          ${createHudCard("Bz Component", "—", "nT", "bz")}
        </div>
      </div>

      <div class="chart-panel">
        <canvas id="xray-chart" height="110" aria-label="GOES X-ray chart"></canvas>
      </div>

      <div id="noaa-alerts" class="alert-list"></div>
    `;

    this.load();
  }

  async load() {
    try {
      const [kp, wind, mag, alerts, xray] = await Promise.allSettled([
        api.getKpIndex(),
        api.getSolarWind(),
        api.getMagneticField(),
        api.getNOAAAlerts(),
        api.getGOESXray()
      ]);

      if (kp.status === "fulfilled") {
        const latest = kp.value.data.at(-1);
        this.setHud("kp", latest?.kp_index ?? latest?.Kp ?? "—");
        state.set("data.kpIndex", latest);
      }

      if (wind.status === "fulfilled") {
        const latest = wind.value.data.at(-1);
        this.setHud("wind", formatNumber(latest?.speed, { maximumFractionDigits: 0 }));
        this.setHud("density", formatNumber(latest?.density, { maximumFractionDigits: 1 }));
        state.set("data.solarWind", latest);
      }

      if (mag.status === "fulfilled") {
        const latest = mag.value.data.at(-1);
        this.setHud("bz", formatNumber(latest?.bz_gsm, { maximumFractionDigits: 1 }));
      }

      if (alerts.status === "fulfilled") {
        this.renderAlerts(alerts.value.data);
      }

      if (xray.status === "fulfilled") {
        this.renderChart(xray.value.data);
      }
    } catch (error) {
      state.addError("Space Weather", error);
    }
  }

  renderAlerts(alerts) {
    const target = this.container.querySelector("#noaa-alerts");
    const rows = Array.isArray(alerts) ? alerts.slice(-5).reverse() : [];

    target.innerHTML = rows.length
      ? rows.map((alert) => `
          <article class="alert-card">
            <strong>${alert.product_id || "NOAA Alert"}</strong>
            <p>${alert.message || alert.summary || "Space weather alert issued."}</p>
          </article>
        `).join("")
      : `<article class="alert-card ok">No active NOAA alerts detected.</article>`;
  }

  renderChart(rows) {
    const canvas = this.container.querySelector("#xray-chart");
    const points = (rows || []).slice(-90);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: points.map((point) => new Date(point.time_tag).toLocaleTimeString()),
        datasets: [
          {
            label: "X-ray flux",
            data: points.map((point) => point.flux),
            borderColor: "#00f5ff",
            backgroundColor: "rgba(0,245,255,0.12)",
            tension: 0.25,
            pointRadius: 0,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#e8f4f8" }
          }
        },
        scales: {
          x: {
            ticks: { color: "rgba(232,244,248,0.6)", maxTicksLimit: 8 },
            grid: { color: "rgba(0,245,255,0.08)" }
          },
          y: {
            type: "logarithmic",
            ticks: { color: "rgba(232,244,248,0.6)" },
            grid: { color: "rgba(0,245,255,0.08)" }
          }
        }
      }
    });
  }

  setHud(key, value) {
    const node = this.container.querySelector(`[data-key="${key}"] .hud-value`);
    if (node) node.textContent = value;
  }
}
