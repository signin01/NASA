import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { router } from "../core/router.js";
import { createHudCard, formatNumber } from "../core/utils.js";

export class HeroSection {
  constructor(container) {
    this.container = container;
    this.phrases = [
      "Tracking orbital telemetry",
      "Reading solar weather",
      "Listening to deep space",
      "Mapping near-Earth objects",
      "Synchronizing mission data"
    ];
    this.phraseIndex = 0;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="mission-tag">MISSION CONTROL v5.0</p>
          <h1 class="hero-title" aria-label="COSMOS">
            ${"COSMOS".split("").map((letter) => `<span>${letter}</span>`).join("")}
          </h1>
          <p id="hero-typewriter" class="hero-subtitle">${this.phrases[0]}</p>

          <div class="hero-actions">
            <button class="primary-action" type="button" data-go="iss-tracker">Track ISS</button>
            <button class="secondary-action" type="button" data-go="apod">Open NASA Vault</button>
            <button class="text-action" type="button" data-go="space-weather">Space Weather</button>
          </div>

          <div class="hero-stats" id="hero-stats">
            ${createHudCard("Tracked Satellites", "9,600+", "", "satellites")}
            ${createHudCard("Exoplanets", "5,600+", "", "exoplanets")}
            ${createHudCard("ISS Altitude", "—", "km", "iss-alt")}
            ${createHudCard("Crew In Space", "—", "", "crew")}
            ${createHudCard("ISS Speed", "—", "km/h", "iss-speed")}
            ${createHudCard("Nearest Star", "4.24", "ly", "star")}
          </div>
        </div>

        <div class="hero-visual">
          <div class="solar-system-widget" aria-label="Animated solar system">
            <div class="sun"></div>
            ${this.planets()}
            <div class="asteroid-belt">
              ${Array.from({ length: 30 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}
            </div>
          </div>

          <aside class="live-card">
            <p>LIVE ISS</p>
            <strong id="hero-iss">Awaiting signal</strong>
            <span id="hero-crew">Crew count pending</span>
          </aside>
        </div>
      </div>
    `;

    this.bind();
    this.rotatePhrase();
    this.loadLiveData();
  }

  planets() {
    const planets = [
      ["mercury", 42],
      ["venus", 62],
      ["earth", 84],
      ["mars", 110],
      ["jupiter", 150],
      ["saturn", 190],
      ["uranus", 225],
      ["neptune", 255]
    ];

    return planets.map(([name, size], index) => `
      <button class="planet-orbit ${name}" style="--orbit:${size}px; --period:${7 + index * 4}s" type="button" data-planet="${name}" aria-label="${name}">
        <span></span>
      </button>
    `).join("");
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      const go = event.target.closest("[data-go]");
      if (go) router.go(go.dataset.go);

      const planet = event.target.closest("[data-planet]");
      if (planet) router.go("solar-system");
    });
  }

  rotatePhrase() {
    const node = this.container.querySelector("#hero-typewriter");
    if (!node) return;

    setInterval(() => {
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
      node.textContent = this.phrases[this.phraseIndex];
    }, 3000);
  }

  async loadLiveData() {
    try {
      const [issResult, crewResult] = await Promise.allSettled([
        api.getISSPosition(),
        api.getAstronauts()
      ]);

      if (issResult.status === "fulfilled") {
        const iss = issResult.value.data;
        state.set("data.iss", iss);

        this.setStat("iss-alt", formatNumber(iss.altitude, { maximumFractionDigits: 0 }));
        this.setStat("iss-speed", formatNumber(iss.velocity, { maximumFractionDigits: 0 }));

        const heroIss = this.container.querySelector("#hero-iss");
        heroIss.textContent = `${iss.latitude.toFixed(2)}°, ${iss.longitude.toFixed(2)}°`;
      }

      if (crewResult.status === "fulfilled") {
        const crew = crewResult.value.data;
        state.set("data.astronauts", crew.people || []);

        this.setStat("crew", String(crew.number || crew.people?.length || "—"));
        this.container.querySelector("#hero-crew").textContent = `${crew.number || 0} humans currently in space`;
      }
    } catch (error) {
      state.addError("Hero", error);
    }
  }

  setStat(key, value) {
    const panel = this.container.querySelector(`[data-key="${key}"] .hud-value`);
    if (!panel) return;

    panel.textContent = value;
    panel.classList.add("flash");
    setTimeout(() => panel.classList.remove("flash"), 320);
  }
}
