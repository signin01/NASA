import * as satellite from "satellite.js";
import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createHudCard, createSectionTitle, formatNumber } from "../core/utils.js";

export class SatelliteTracker {
  constructor(container) {
    this.container = container;
    this.tle = null;
    this.timer = null;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("ORBIT PROPAGATION", "Satellite Tracker")}

      <div class="section-toolbar">
        <input id="norad-input" class="number-control" type="number" value="25544" aria-label="NORAD ID" />
        <button class="chip" type="button" data-load-sat>Load Satellite</button>
      </div>

      <div class="asteroid-stats">
        ${createHudCard("Latitude", "—", "deg", "sat-lat")}
        ${createHudCard("Longitude", "—", "deg", "sat-lon")}
        ${createHudCard("Altitude", "—", "km", "sat-alt")}
        ${createHudCard("Velocity", "SGP4", "", "sat-model")}
      </div>

      <div class="side-panel">
        <h3 id="sat-title">ISS TLE</h3>
        <pre id="tle-output">Loading TLE...</pre>
      </div>
    `;

    this.bind();
    this.load();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-load-sat]")) this.load();
    });
  }

  async load() {
    const catnr = this.container.querySelector("#norad-input").value || 25544;

    try {
      const { data } = await api.getCelestrakTLE(catnr);
      const lines = data.trim().split(/\r?\n/);

      this.tle = {
        name: lines[0],
        line1: lines[1],
        line2: lines[2]
      };

      this.container.querySelector("#sat-title").textContent = this.tle.name;
      this.container.querySelector("#tle-output").textContent = data;

      clearInterval(this.timer);
      this.propagate();
      this.timer = setInterval(() => this.propagate(), 10000);
    } catch (error) {
      this.container.querySelector("#tle-output").textContent = "TLE signal unavailable.";
      state.addError("Satellite Tracker", error);
    }
  }

  propagate() {
    if (!this.tle) return;

    try {
      const satrec = satellite.twoline2satrec(this.tle.line1, this.tle.line2);
      const now = new Date();
      const positionAndVelocity = satellite.propagate(satrec, now);

      if (!positionAndVelocity.position) return;

      const gmst = satellite.gstime(now);
      const geo = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

      const lat = satellite.degreesLat(geo.latitude);
      const lon = satellite.degreesLong(geo.longitude);
      const alt = geo.height;

      this.setHud("sat-lat", lat.toFixed(3));
      this.setHud("sat-lon", lon.toFixed(3));
      this.setHud("sat-alt", formatNumber(alt, { maximumFractionDigits: 1 }));
    } catch (error) {
      state.addError("Satellite Propagation", error);
    }
  }

  setHud(key, value) {
    const node = this.container.querySelector(`[data-key="${key}"] .hud-value`);
    if (node) node.textContent = value;
  }

  destroy() {
    clearInterval(this.timer);
  }
}
