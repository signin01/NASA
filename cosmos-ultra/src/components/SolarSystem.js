import { createSectionTitle } from "../core/utils.js";

export class SolarSystem {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.speed = 1;
    this.planets = [
      ["Mercury", 58, 88, "#b8a48a"],
      ["Venus", 86, 225, "#e7c783"],
      ["Earth", 118, 365, "#4fa3ff"],
      ["Mars", 154, 687, "#ff6b35"],
      ["Jupiter", 215, 4333, "#d9b384"],
      ["Saturn", 285, 10759, "#f3dc9a"],
      ["Uranus", 350, 30687, "#78e3ff"],
      ["Neptune", 410, 60190, "#5f7cff"]
    ];
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("REAL-TIME ORRERY", "Solar System Command")}

      <div class="section-toolbar">
        <label class="range-control">
          Speed
          <input id="orrery-speed" type="range" min="0.1" max="50" step="0.1" value="1" />
        </label>
        <button class="chip active" type="button" data-view="top">Top Down</button>
        <button class="chip" type="button" data-view="tilt">Tilted</button>
      </div>

      <div class="canvas-panel">
        <canvas id="orrery-canvas" width="960" height="620" aria-label="Animated solar system canvas"></canvas>
      </div>

      <div id="planet-detail" class="side-panel planet-detail">
        Click a planet orbit for mission data.
      </div>
    `;

    this.canvas = this.container.querySelector("#orrery-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.bind();
    this.draw();
  }

  bind() {
    this.container.querySelector("#orrery-speed").addEventListener("input", (event) => {
      this.speed = Number(event.target.value);
    });

    this.canvas.addEventListener("click", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
      const hit = this.getPlanetAt(x, y);

      if (hit) {
        this.container.querySelector("#planet-detail").innerHTML = `
          <h3>${hit.name}</h3>
          <p>Mean orbital radius: ${hit.radius} million km scale marker.</p>
          <p>Orbital period: ${hit.period.toLocaleString()} Earth days.</p>
        `;
      }
    });
  }

  draw(time = 0) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 480);
    bg.addColorStop(0, "rgba(255,214,10,0.08)");
    bg.addColorStop(1, "rgba(0,0,10,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffd60a";
    ctx.shadowColor = "#ffd60a";
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    this.planets.forEach(([name, radius, period, color], index) => {
      ctx.strokeStyle = "rgba(0,245,255,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const angle = time * 0.00008 * this.speed * (365 / period) + index;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, index > 3 ? 7 : 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(232,244,248,0.72)";
      ctx.font = "12px Share Tech Mono";
      ctx.fillText(name, x + 10, y + 4);
    });

    requestAnimationFrame((nextTime) => this.draw(nextTime));
  }

  getPlanetAt(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const time = performance.now();

    for (let index = 0; index < this.planets.length; index += 1) {
      const [name, radius, period] = this.planets[index];
      const angle = time * 0.00008 * this.speed * (365 / period) + index;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      const distance = Math.hypot(x - px, y - py);

      if (distance < 14) {
        return { name, radius, period };
      }
    }

    return null;
  }
}
