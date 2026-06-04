import Chart from "chart.js/auto";
import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createHudCard, createSectionTitle, formatNumber } from "../core/utils.js";

export class ExoplanetCommand {
  constructor(container) {
    this.container = container;
    this.chart = null;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("ALIEN WORLDS", "Exoplanet Command")}

      <div class="asteroid-stats">
        ${createHudCard("Loaded Worlds", "—", "", "exo-total")}
        ${createHudCard("Earth Size", "—", "", "exo-earth")}
        ${createHudCard("Hot Worlds", "—", "", "exo-hot")}
        ${createHudCard("With Distance", "—", "", "exo-distance")}
      </div>

      <div class="chart-panel">
        <canvas id="exoplanet-chart" height="130" aria-label="Exoplanet radius chart"></canvas>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Planet</th>
              <th>Radius</th>
              <th>Orbit</th>
              <th>Temp</th>
              <th>Distance</th>
              <th>Discovery</th>
            </tr>
          </thead>
          <tbody id="exoplanet-table">
            <tr><td colspan="6">Loading exoplanet archive...</td></tr>
          </tbody>
        </table>
      </div>
    `;

    this.load();
  }

  async load() {
    const tbody = this.container.querySelector("#exoplanet-table");

    try {
      const { data } = await api.getExoplanets(120);
      const rows = Array.isArray(data) ? data : [];
      state.set("data.exoplanets", rows);

      const earthSized = rows.filter((planet) => Number(planet.pl_rade) > 0.75 && Number(planet.pl_rade) < 1.5);
      const hot = rows.filter((planet) => Number(planet.pl_eqt) > 700);
      const withDistance = rows.filter((planet) => Number.isFinite(Number(planet.st_dist)));

      this.setStat("exo-total", rows.length);
      this.setStat("exo-earth", earthSized.length);
      this.setStat("exo-hot", hot.length);
      this.setStat("exo-distance", withDistance.length);

      tbody.innerHTML = rows.slice(0, 80).map((planet) => `
        <tr>
          <td>${planet.pl_name || "Unnamed"}</td>
          <td>${formatNumber(planet.pl_rade, { maximumFractionDigits: 2 })} R⊕</td>
          <td>${formatNumber(planet.pl_orbper, { maximumFractionDigits: 1 })} d</td>
          <td>${formatNumber(planet.pl_eqt, { maximumFractionDigits: 0 })} K</td>
          <td>${formatNumber(planet.st_dist, { maximumFractionDigits: 1 })} pc</td>
          <td>${planet.discoverymethod || "—"}</td>
        </tr>
      `).join("");

      this.renderChart(rows);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="6">Exoplanet archive unavailable.</td></tr>`;
      state.addError("Exoplanets", error);
    }
  }

  renderChart(rows) {
    const canvas = this.container.querySelector("#exoplanet-chart");
    const points = rows
      .filter((planet) => Number(planet.pl_rade) && Number(planet.pl_orbper))
      .slice(0, 70);

    this.chart = new Chart(canvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Radius vs Orbit",
            data: points.map((planet) => ({
              x: Number(planet.pl_orbper),
              y: Number(planet.pl_rade)
            })),
            borderColor: "#bf5fff",
            backgroundColor: "rgba(191,95,255,0.75)"
          }
        ]
      },
      options: {
        plugins: {
          legend: { labels: { color: "#e8f4f8" } }
        },
        scales: {
          x: {
            type: "logarithmic",
            title: { display: true, text: "Orbital period days", color: "#e8f4f8" },
            ticks: { color: "rgba(232,244,248,0.65)" },
            grid: { color: "rgba(0,245,255,0.08)" }
          },
          y: {
            title: { display: true, text: "Earth radii", color: "#e8f4f8" },
            ticks: { color: "rgba(232,244,248,0.65)" },
            grid: { color: "rgba(0,245,255,0.08)" }
          }
        }
      }
    });
  }

  setStat(key, value) {
    const node = this.container.querySelector(`[data-key="${key}"] .hud-value`);
    if (node) node.textContent = value;
  }
}
