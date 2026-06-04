import { createSectionTitle, formatNumber } from "../core/utils.js";

export class PhysicsSimulators {
  constructor(container) {
    this.container = container;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("SPACE MATH LAB", "Physics Simulators")}

      <div class="sim-grid">
        <article class="side-panel">
          <h3>Escape Velocity</h3>
          <label>Mass in Earth masses <input id="mass-input" type="range" min="0.1" max="20" value="1" step="0.1" /></label>
          <label>Radius in Earth radii <input id="radius-input" type="range" min="0.1" max="10" value="1" step="0.1" /></label>
          <strong id="escape-result" class="big-readout">—</strong>
        </article>

        <article class="side-panel">
          <h3>Orbital Period</h3>
          <label>Orbit radius km <input id="orbit-input" type="range" min="6700" max="100000" value="6771" step="100" /></label>
          <strong id="period-result" class="big-readout">—</strong>
        </article>

        <article class="side-panel">
          <h3>Rocket Equation</h3>
          <label>Isp seconds <input id="isp-input" type="range" min="200" max="460" value="311" step="1" /></label>
          <label>Mass ratio <input id="ratio-input" type="range" min="1.1" max="20" value="3" step="0.1" /></label>
          <strong id="rocket-result" class="big-readout">—</strong>
        </article>
      </div>
    `;

    this.bind();
    this.calculate();
  }

  bind() {
    this.container.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => this.calculate());
    });
  }

  calculate() {
    const earthMass = 5.972e24;
    const earthRadius = 6371000;
    const g = 6.6743e-11;

    const mass = Number(this.container.querySelector("#mass-input").value) * earthMass;
    const radius = Number(this.container.querySelector("#radius-input").value) * earthRadius;
    const escape = Math.sqrt((2 * g * mass) / radius) / 1000;

    const muEarth = 3.986004418e14;
    const orbitRadius = Number(this.container.querySelector("#orbit-input").value) * 1000;
    const period = 2 * Math.PI * Math.sqrt(Math.pow(orbitRadius, 3) / muEarth) / 60;

    const isp = Number(this.container.querySelector("#isp-input").value);
    const ratio = Number(this.container.querySelector("#ratio-input").value);
    const deltaV = isp * 9.80665 * Math.log(ratio) / 1000;

    this.container.querySelector("#escape-result").textContent = `${formatNumber(escape, { maximumFractionDigits: 2 })} km/s`;
    this.container.querySelector("#period-result").textContent = `${formatNumber(period, { maximumFractionDigits: 1 })} min`;
    this.container.querySelector("#rocket-result").textContent = `${formatNumber(deltaV, { maximumFractionDigits: 2 })} km/s`;
  }
}
