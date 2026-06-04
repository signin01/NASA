import { createSectionTitle } from "../core/utils.js";

export class DistanceRuler {
  constructor(container) {
    this.container = container;
    this.levels = [
      ["Bedroom", "3 m", "A human-scale reference point."],
      ["Moon", "384,400 km", "Light takes about 1.3 seconds to cross this gap."],
      ["Sun", "1 AU", "Sunlight reaches Earth in about 8.3 minutes."],
      ["Mars", "54.6 million km", "Closest approach distance varies heavily."],
      ["Proxima Centauri", "4.24 ly", "The nearest known star to the Sun."],
      ["Andromeda", "2.5 million ly", "Our nearest large galactic neighbor."],
      ["Observable Universe", "46 billion ly", "The edge of what light has had time to reveal."]
    ];
    this.index = 0;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("COSMIC SCALE", "Cosmic Distance Ruler")}

      <div class="distance-shell">
        <button class="chip" type="button" data-zoom-out>Zoom Out</button>
        <div class="distance-stage">
          <div class="distance-pulse"></div>
          <h3 id="distance-name"></h3>
          <strong id="distance-value"></strong>
          <p id="distance-description"></p>
        </div>
        <button class="chip" type="button" data-zoom-in>Zoom In</button>
      </div>

      <div class="timeline-scale">
        ${this.levels.map((level, index) => `
          <button type="button" data-level="${index}">
            <span>${level[0]}</span>
          </button>
        `).join("")}
      </div>

      <article class="side-panel">
        <h3>Number Scale</h3>
        <input id="scale-number" class="number-control" type="number" value="1000000" />
        <p id="scale-output"></p>
      </article>
    `;

    this.bind();
    this.render();
    this.renderNumberScale();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-zoom-out]")) {
        this.index = Math.min(this.levels.length - 1, this.index + 1);
        this.render();
      }

      if (event.target.closest("[data-zoom-in]")) {
        this.index = Math.max(0, this.index - 1);
        this.render();
      }

      const level = event.target.closest("[data-level]");
      if (level) {
        this.index = Number(level.dataset.level);
        this.render();
      }
    });

    this.container.querySelector("#scale-number").addEventListener("input", () => this.renderNumberScale());
  }

  render() {
    const [name, value, description] = this.levels[this.index];

    this.container.querySelector("#distance-name").textContent = name;
    this.container.querySelector("#distance-value").textContent = value;
    this.container.querySelector("#distance-description").textContent = description;

    this.container.querySelectorAll("[data-level]").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.level) === this.index);
    });
  }

  renderNumberScale() {
    const number = Number(this.container.querySelector("#scale-number").value || 0);
    const output = this.container.querySelector("#scale-output");

    if (number < 1000) output.textContent = "Small enough for everyday counting.";
    else if (number < 1000000) output.textContent = "Thousands: minutes, meters, people, small datasets.";
    else if (number < 1000000000) output.textContent = "Millions: city scales, seconds in weeks, large image pixels.";
    else if (number < 1000000000000) output.textContent = "Billions: planetary populations and decade-scale seconds.";
    else output.textContent = "Trillions and beyond: astronomical distances start to feel at home.";
  }
}
