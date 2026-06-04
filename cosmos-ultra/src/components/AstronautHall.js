import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createSectionTitle, escapeHtml } from "../core/utils.js";

export class AstronautHall {
  constructor(container) {
    this.container = container;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("HUMAN SPACEFLIGHT", "Astronaut Hall")}

      <div class="astronaut-hero">
        <div>
          <p class="section-kicker">CURRENTLY IN SPACE</p>
          <h3 id="astronaut-count">Awaiting crew signal...</h3>
          <p>Live crew data is pulled from the public astronauts endpoint when available.</p>
        </div>
        <button class="chip" type="button" data-refresh-crew>Refresh Crew</button>
      </div>

      <div id="astronaut-grid" class="card-grid">
        ${Array.from({ length: 6 }, () => `<div class="mission-card skeleton-card"></div>`).join("")}
      </div>
    `;

    this.bind();
    this.load();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-refresh-crew]")) this.load();
    });
  }

  async load() {
    const grid = this.container.querySelector("#astronaut-grid");

    try {
      const { data } = await api.getAstronauts();
      const people = data.people || [];
      state.set("data.astronauts", people);

      this.container.querySelector("#astronaut-count").textContent = `${data.number || people.length} humans on orbit`;

      grid.innerHTML = people.map((person, index) => `
        <article class="mission-card astronaut-card">
          <div class="avatar-ring">${escapeHtml(person.name.split(" ").map((part) => part[0]).join("").slice(0, 2))}</div>
          <div>
            <p class="section-kicker">CREW ${String(index + 1).padStart(2, "0")}</p>
            <h3>${escapeHtml(person.name)}</h3>
            <p>Craft assignment: <strong>${escapeHtml(person.craft)}</strong></p>
          </div>
        </article>
      `).join("");
    } catch (error) {
      this.container.querySelector("#astronaut-count").textContent = "Crew signal unavailable";
      grid.innerHTML = `<div class="signal-lost">Astronaut manifest unavailable.</div>`;
      state.addError("Astronaut Hall", error);
    }
  }
}
