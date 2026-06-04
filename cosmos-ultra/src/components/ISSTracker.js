import L from "leaflet";
import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createHudCard, createSectionTitle, formatNumber, kmToMiles } from "../core/utils.js";

export class ISSTracker {
  constructor(container) {
    this.container = container;
    this.map = null;
    this.marker = null;
    this.track = null;
    this.positions = [];
    this.timer = null;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("ORBITAL TELEMETRY", "Live ISS Tracker")}
      <div class="section-toolbar">
        <button class="chip active" type="button" data-unit="metric">Metric</button>
        <button class="chip" type="button" data-unit="imperial">Imperial</button>
        <button class="chip" type="button" data-refresh>Refresh</button>
      </div>

      <div class="iss-hud">
        ${createHudCard("Latitude", "—", "deg", "lat")}
        ${createHudCard("Longitude", "—", "deg", "lon")}
        ${createHudCard("Altitude", "—", "km", "alt")}
        ${createHudCard("Velocity", "—", "km/h", "vel")}
        ${createHudCard("Visibility", "—", "", "visibility")}
        ${createHudCard("Footprint", "—", "km", "footprint")}
        ${createHudCard("Inclination", "51.6", "deg", "inclination")}
        ${createHudCard("Orbital Period", "92.7", "min", "period")}
      </div>

      <div class="iss-main-grid">
        <div id="iss-map" role="img" aria-label="Map showing current ISS position"></div>
        <aside class="side-panel">
          <h3>Current Crew</h3>
          <div id="crew-panel" class="crew-list skeleton-card">Loading crew manifest...</div>
          <h3>ISS Fact</h3>
          <div id="facts-carousel" class="fact-card"></div>
        </aside>
      </div>
    `;

    this.initMap();
    this.bind();
    this.updateISSData();
    this.updateCrew();
    this.updateFacts();

    this.timer = setInterval(() => {
      if (state.get("settings.autoRefresh")) this.updateISSData();
    }, state.get("settings.refreshInterval"));
  }

  initMap() {
    this.map = L.map("iss-map", {
      zoomControl: true,
      attributionControl: true
    }).setView([0, 0], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 8,
      attribution: "&copy; OpenStreetMap &copy; CARTO"
    }).addTo(this.map);

    const icon = L.divIcon({
      className: "iss-marker",
      html: `<span>ISS</span>`,
      iconSize: [52, 32],
      iconAnchor: [26, 16]
    });

    this.marker = L.marker([0, 0], { icon }).addTo(this.map);
    this.track = L.polyline([], {
      color: "#00f5ff",
      weight: 2,
      dashArray: "6, 8",
      opacity: 0.85
    }).addTo(this.map);
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      const unitButton = event.target.closest("[data-unit]");
      if (unitButton) {
        this.container.querySelectorAll("[data-unit]").forEach((button) => button.classList.remove("active"));
        unitButton.classList.add("active");
        state.set("settings.units", unitButton.dataset.unit);
        this.updateISSData(false);
      }

      if (event.target.closest("[data-refresh]")) {
        this.updateISSData();
        this.updateCrew();
      }
    });
  }

  async updateISSData(fly = true) {
    try {
      const { data } = await api.getISSPosition();
      const lat = Number(data.latitude);
      const lon = Number(data.longitude);
      const altitudeKm = Number(data.altitude);
      const velocityKmh = Number(data.velocity);
      const imperial = state.get("settings.units") === "imperial";

      this.positions.push([lat, lon]);
      this.positions = this.positions.slice(-30);

      if (this.marker) this.marker.setLatLng([lat, lon]);
      if (this.track) this.track.setLatLngs(this.positions);
      if (this.map && fly) this.map.flyTo([lat, lon], Math.max(this.map.getZoom(), 3), { duration: 0.8 });

      this.setHud("lat", lat.toFixed(3));
      this.setHud("lon", lon.toFixed(3));
      this.setHud("alt", formatNumber(imperial ? kmToMiles(altitudeKm) : altitudeKm, { maximumFractionDigits: 0 }));
      this.setHud("vel", formatNumber(imperial ? kmToMiles(velocityKmh) : velocityKmh, { maximumFractionDigits: 0 }));
      this.setHud("visibility", data.visibility || "—");
      this.setHud("footprint", formatNumber(imperial ? kmToMiles(data.footprint) : data.footprint, { maximumFractionDigits: 0 }));

      this.setUnit("alt", imperial ? "mi" : "km");
      this.setUnit("vel", imperial ? "mph" : "km/h");
      this.setUnit("footprint", imperial ? "mi" : "km");

      state.set("data.iss", data);
    } catch (error) {
      state.addError("ISS Tracker", error);
    }
  }

  async updateCrew() {
    const panel = this.container.querySelector("#crew-panel");

    try {
      const { data } = await api.getAstronauts();
      const people = data.people || [];

      panel.classList.remove("skeleton-card");
      panel.innerHTML = people.map((person) => `
        <article class="crew-card">
          <strong>${person.name}</strong>
          <span>${person.craft}</span>
        </article>
      `).join("");

      state.set("data.astronauts", people);
    } catch (error) {
      panel.textContent = "Crew signal unavailable.";
      state.addError("ISS Crew", error);
    }
  }

  updateFacts() {
    const facts = [
      "The ISS sees about 16 sunrises and sunsets every day.",
      "The station has been continuously occupied since November 2000.",
      "ISS solar arrays generate roughly 120 kilowatts of power.",
      "Astronauts exercise around two hours daily to protect muscle and bone."
    ];

    const carousel = this.container.querySelector("#facts-carousel");
    let index = 0;

    const render = () => {
      carousel.textContent = facts[index];
      index = (index + 1) % facts.length;
    };

    render();
    setInterval(render, 8000);
  }

  setHud(key, value) {
    const node = this.container.querySelector(`[data-key="${key}"] .hud-value`);
    if (!node) return;

    node.textContent = value;
    node.classList.add("flash");
    setTimeout(() => node.classList.remove("flash"), 300);
  }

  setUnit(key, unit) {
    const node = this.container.querySelector(`[data-key="${key}"] .hud-unit`);
    if (node) node.textContent = unit;
  }

  destroy() {
    clearInterval(this.timer);
    if (this.map) this.map.remove();
  }
}
