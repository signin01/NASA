import { createSectionTitle } from "../core/utils.js";

export class StarMap {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("CELESTIAL CARTOGRAPHY", "Interactive Star Map")}

      <div class="section-toolbar">
        <button class="chip active" type="button" data-generate-stars>Generate Sky</button>
        <button class="chip" type="button" data-constellations>Toggle Lines</button>
      </div>

      <div class="canvas-panel">
        <canvas id="star-map-canvas" width="960" height="540" aria-label="Generated star map"></canvas>
      </div>

      <div class="side-panel">
        <h3>Sky Notes</h3>
        <p>This browser map renders a local star field with constellation-style overlays for study and visual navigation.</p>
      </div>
    `;

    this.canvas = this.container.querySelector("#star-map-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.generate();
    this.bind();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-generate-stars]")) this.generate();
      if (event.target.closest("[data-constellations]")) this.draw(true);
    });

    this.canvas.addEventListener("mousemove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
      this.draw(false, { x, y });
    });
  }

  generate() {
    this.stars = Array.from({ length: 650 }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      mag: Math.random(),
      color: Math.random() > 0.8 ? "#ffe7a0" : Math.random() > 0.65 ? "#dff7ff" : "#ffffff"
    }));

    this.draw();
  }

  draw(lines = false, pointer = null) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const gradient = ctx.createRadialGradient(760, 90, 0, 760, 90, 600);
    gradient.addColorStop(0, "rgba(191,95,255,0.12)");
    gradient.addColorStop(1, "rgba(0,0,10,1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.stars.forEach((star) => {
      ctx.globalAlpha = 0.4 + (1 - star.mag) * 0.6;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 1 + (1 - star.mag) * 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    if (lines) {
      ctx.strokeStyle = "rgba(0,245,255,0.34)";
      ctx.lineWidth = 1;
      for (let index = 0; index < 26; index += 1) {
        const a = this.stars[index * 3];
        const b = this.stars[index * 3 + 1];
        const c = this.stars[index * 3 + 2];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
      }
    }

    if (pointer) {
      const nearest = this.stars
        .map((star) => ({ star, dist: Math.hypot(pointer.x - star.x, pointer.y - star.y) }))
        .sort((a, b) => a.dist - b.dist)[0];

      if (nearest?.dist < 24) {
        ctx.strokeStyle = "#00f5ff";
        ctx.beginPath();
        ctx.arc(nearest.star.x, nearest.star.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}
