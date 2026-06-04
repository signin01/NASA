import rocketsData from "../data/rockets.json";
import { createSectionTitle, formatNumber } from "../core/utils.js";

export class TechLab {
  constructor(container) {
    this.container = container;
    this.rockets = rocketsData.rockets || [];
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("ENGINEERING BAY", "Space Technology Lab")}

      <div class="tech-grid">
        <article class="side-panel">
          <h3>Rocket Engine Comparison</h3>
          <div class="engine-diagram">
            <span class="injector"></span>
            <span class="chamber"></span>
            <span class="nozzle"></span>
            <span class="plume"></span>
          </div>
          <p>Combustion flow, chamber pressure and nozzle expansion define engine performance.</p>
        </article>

        <article class="side-panel">
          <h3>Telescope Types</h3>
          <div class="tech-list">
            ${["Refractor", "Reflector", "Cassegrain", "Radio", "X-ray", "Space"].map((item) => `<span class="badge">${item}</span>`).join("")}
          </div>
          <p>Different wavelengths reveal different physical structures across the universe.</p>
        </article>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Rocket</th>
              <th>Height</th>
              <th>Payload LEO</th>
              <th>Stages</th>
              <th>Operator</th>
            </tr>
          </thead>
          <tbody>
            ${this.rockets.map((rocket) => `
              <tr>
                <td>${rocket.name}</td>
                <td>${formatNumber(rocket.height_m, { maximumFractionDigits: 1 })} m</td>
                <td>${formatNumber(rocket.payload_leo_kg)} kg</td>
                <td>${rocket.stages}</td>
                <td>${rocket.operator}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }
}
