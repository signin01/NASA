import { lerp } from "../core/utils.js";
import { state } from "../core/state.js";

export class Starfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext("2d");
    this.stars = [];
    this.shootingStars = [];
    this.mouse = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.running = true;
    this.lastShot = 0;
  }

  init() {
    if (!this.canvas || !this.ctx) return;

    this.resize();
    this.createStars();
    this.bind();
    this.animate(0);
  }

  bind() {
    window.addEventListener("resize", () => {
      this.resize();
      this.createStars();
    });

    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    document.addEventListener("visibilitychange", () => {
      this.running = !document.hidden;
      if (this.running) requestAnimationFrame((time) => this.animate(time));
    });

    state.subscribe("settings.starDensity", () => this.createStars());
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(window.innerWidth * ratio);
    this.canvas.height = Math.floor(window.innerHeight * ratio);
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  createStars() {
    const density = Number(state.get("settings.starDensity")) || 1500;
    const colors = ["#ffffff", "#dff7ff", "#ffe7a0", "#ffb4a2"];
    const weights = [0.7, 0.15, 0.1, 0.05];

    this.stars = Array.from({ length: density }, (_, index) => {
      const layer = index % 4;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: [0.35, 0.7, 1.05, 1.6][layer] * (0.8 + Math.random() * 0.8),
        opacity: [0.35, 0.5, 0.65, 0.8][layer] + Math.random() * 0.2,
        depth: [0.008, 0.02, 0.05, 0.1][layer],
        phase: Math.random() * Math.PI * 2,
        color: this.weighted(colors, weights)
      };
    });
  }

  weighted(values, weights) {
    const roll = Math.random();
    let sum = 0;

    for (let index = 0; index < values.length; index += 1) {
      sum += weights[index];
      if (roll <= sum) return values[index];
    }

    return values[0];
  }

  animate(time) {
    if (!this.running) return;

    this.offset.x = lerp(this.offset.x, this.mouse.x, 0.035);
    this.offset.y = lerp(this.offset.y, this.mouse.y, 0.035);

    this.draw(time);

    if (time - this.lastShot > 5000 + Math.random() * 7000) {
      this.createShootingStar();
      this.lastShot = time;
    }

    requestAnimationFrame((nextTime) => this.animate(nextTime));
  }

  draw(time) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const nebula = ctx.createRadialGradient(
      window.innerWidth * 0.78,
      window.innerHeight * 0.22,
      0,
      window.innerWidth * 0.78,
      window.innerHeight * 0.22,
      window.innerWidth * 0.7
    );
    nebula.addColorStop(0, "rgba(191,95,255,0.16)");
    nebula.addColorStop(0.45, "rgba(0,245,255,0.06)");
    nebula.addColorStop(1, "rgba(0,0,10,0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (const star of this.stars) {
      const twinkle = 0.7 + Math.sin(time * 0.002 + star.phase) * 0.3;
      const x = star.x + this.offset.x * star.depth * 260;
      const y = star.y + this.offset.y * star.depth * 260;

      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.opacity * twinkle;
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    this.drawShootingStars(time);
  }

  createShootingStar() {
    this.shootingStars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.45,
      length: 80 + Math.random() * 140,
      progress: 0,
      speed: 0.016 + Math.random() * 0.012
    });
  }

  drawShootingStars() {
    this.shootingStars = this.shootingStars.filter((star) => star.progress < 1);

    for (const star of this.shootingStars) {
      star.progress += star.speed;

      const x = star.x + star.progress * 420;
      const y = star.y + star.progress * 240;

      const gradient = this.ctx.createLinearGradient(x, y, x - star.length, y - star.length * 0.45);
      gradient.addColorStop(0, "rgba(255,255,255,0.95)");
      gradient.addColorStop(1, "rgba(0,245,255,0)");

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x - star.length, y - star.length * 0.45);
      this.ctx.stroke();
    }
  }
}
