import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createHudCard, createSectionTitle, formatNumber, todayISO } from "../core/utils.js";

export class AsteroidHQ {
  constructor(container) {
    this.container = container;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("NEAR-EARTH OBJECTS", "Asteroid & Fireball HQ")}

      <div class="section-toolbar">
        <button class="chip active" type="button" data-range="7">7 Days</button>
        <button class="chip" type="button" data-range="30">30 Days</button>
        <button class="chip" type="button" data-load-fireballs>Fireballs</button>
      </div>

      <div class="asteroid-stats" id="asteroid-stats">
        ${createHudCard("Total NEOs", "—", "", "total")}
        ${createHudCard("Hazardous", "—", "", "hazard")}
        ${createHudCard("Closest", "—", "LD", "closest")}
        ${createHudCard("Largest", "—", "m", "largest")}
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Close Approach</th>
              <th>Diameter</th>
              <th>Distance</th>
              <th>Velocity</th>
              <th>Hazard</th>
            </tr>
          </thead>
          <tbody id="asteroid-table">
            <tr><td colspan="6">Connecting to NEO feed...</td></tr>
          </tbody>
        </table>
      </div>
    `;

    this.bind();
    this.loadNEO(7);
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      const range = event.target.closest("[data-range]");
      if (range) {
        this.container.querySelectorAll("[data-range]").forEach((button) => button.classList.remove("active"));
        range.classList.add("active");
        this.loadNEO(Number(range.dataset.range));
      }

      if (event.target.closest("[data-load-fireballs]")) {
        this.loadFireballs();
      }
    });
  }

  async loadNEO(days) {
    const tbody = this.container.querySelector("#asteroid-table");
    tbody.innerHTML = `<tr><td colspan="6">Loading asteroid feed...</td></tr>`;

    try {
      const { data } = await api.getNEO(todayISO(0), todayISO(Math.min(days, 7)));
      const objects = Object.values(data.near_earth_objects || {}).flat();
      state.set("data.asteroids", objects);

      const hazardous = objects.filter((item) => item.is_potentially_hazardous_asteroid);
      const closest = objects.reduce((best, item) => {
        const distance = Number(item.close_approach_data?.[0]?.miss_distance?.lunar || Infinity);
        return distance < best ? distance : best;
      }, Infinity);

      const largest = objects.reduce((best, item) => {
        const diameter = item.estimated_diameter?.meters?.estimated_diameter_max || 0;
        return Math.max(best, diameter);
      }, 0);

      this.setStat("total", objects.length);
      this.setStat("hazard", hazardous.length);
      this.setStat("closest", Number.isFinite(closest) ? closest.toFixed(2) : "—");
      this.setStat("largest", formatNumber(largest, { maximumFractionDigits: 0 }));

      tbody.innerHTML = objects.slice(0, 40).map((item) => {
        const approach = item.close_approach_data?.[0] || {};
        const diameter = item.estimated_diameter?.meters?.estimated_diameter_max || 0;
        const distance = approach.miss_distance?.lunar || "—";
        const velocity = approach.relative_velocity?.kilometers_per_hour || "—";

        return `
          <tr>
            <td>${item.name}</td>
            <td>${approach.close_approach_date || "—"}</td>
            <td>${formatNumber(diameter, { maximumFractionDigits: 0 })} m</td>
            <td>${formatNumber(distance, { maximumFractionDigits: 2 })} LD</td>
            <td>${formatNumber(velocity, { maximumFractionDigits: 0 })} km/h</td>
            <td><span class="badge ${item.is_potentially_hazardous_asteroid ? "danger" : "ok"}">${item.is_potentially_hazardous_asteroid ? "WATCH" : "CLEAR"}</span></td>
          </tr>
        `;
      }).join("");
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="6">NEO signal unavailable.</td></tr>`;
      state.addError("Asteroid HQ", error);
    }
  }

  async loadFireballs() {
    const tbody = this.container.querySelector("#asteroid-table");
    tbody.innerHTML = `<tr><td colspan="6">Loading JPL fireball data...</td></tr>`;

    try {
      const { data } = await api.getFireballs();
      const fields = data.fields || [];
      const rows = data.data || [];

      tbody.innerHTML = rows.slice(0, 40).map((row) => {
        const record = Object.fromEntries(fields.map((field, index) => [field, row[index]]));

        return `
          <tr>
            <td>Fireball</td>
            <td>${record.date || "—"}</td>
            <td colspan="2">${record.lat || "?"} ${record["lat-dir"] || ""}, ${record.lon || "?"} ${record["lon-dir"] || ""}</td>
            <td>${record.energy || "—"} kt</td>
            <td><span class="badge danger">BOLIDE</span></td>
          </tr>
        `;
      }).join("");
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="6">Fireball data unavailable.</td></tr>`;
      state.addError("Fireballs", error);
    }
  }

  setStat(key, value) {
    const node = this.container.querySelector(`[data-key="${key}"] .hud-value`);
    if (node) node.textContent = value;
  }
}
