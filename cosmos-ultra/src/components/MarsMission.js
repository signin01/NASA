import JSZip from "jszip";
import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createSectionTitle, escapeHtml } from "../core/utils.js";

export class MarsMission {
  constructor(container) {
    this.container = container;
    this.rover = "curiosity";
    this.sol = 3857;
    this.photos = [];
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("RED PLANET OPS", "Mars Mission Center")}

      <div class="section-toolbar">
        <select id="rover-select" class="select-control" aria-label="Select Mars rover">
          <option value="curiosity">Curiosity</option>
          <option value="perseverance">Perseverance</option>
          <option value="opportunity">Opportunity</option>
          <option value="spirit">Spirit</option>
        </select>
        <input id="sol-input" class="number-control" type="number" min="0" value="3857" aria-label="Mars sol" />
        <button class="chip" type="button" data-load-mars>Load Photos</button>
        <button class="chip" type="button" data-random-sol>Random Sol</button>
        <button class="chip" type="button" data-zip>ZIP Selected</button>
      </div>

      <div class="mars-info-grid">
        <article class="side-panel">
          <h3>Rover Signal</h3>
          <p><span>Rover</span><strong id="mars-rover-name">Curiosity</strong></p>
          <p><span>Sol</span><strong id="mars-sol">3857</strong></p>
          <p><span>Photos</span><strong id="mars-photo-count">—</strong></p>
        </article>

        <article class="side-panel">
          <h3>Mars Science</h3>
          <p>Jezero, Gale, Meridiani and Gusev records show a planet shaped by ancient water, dust, volcanism and chemistry.</p>
        </article>
      </div>

      <div id="mars-gallery" class="media-grid">
        ${Array.from({ length: 8 }, () => `<div class="result-card skeleton-card"></div>`).join("")}
      </div>
    `;

    this.bind();
    this.loadPhotos();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-load-mars]")) this.loadFromControls();
      if (event.target.closest("[data-random-sol]")) {
        const input = this.container.querySelector("#sol-input");
        input.value = Math.floor(Math.random() * 2500);
        this.loadFromControls();
      }
      if (event.target.closest("[data-zip]")) this.downloadSelected();
    });
  }

  loadFromControls() {
    this.rover = this.container.querySelector("#rover-select").value;
    this.sol = Number(this.container.querySelector("#sol-input").value || 0);
    this.loadPhotos();
  }

  async loadPhotos() {
    const gallery = this.container.querySelector("#mars-gallery");
    gallery.innerHTML = Array.from({ length: 8 }, () => `<div class="result-card skeleton-card"></div>`).join("");

    this.container.querySelector("#mars-rover-name").textContent = this.rover;
    this.container.querySelector("#mars-sol").textContent = this.sol;

    try {
      const { data } = await api.getMarsRoverPhotos(this.rover, this.sol);
      this.photos = data.photos || [];
      state.set("data.marsPhotos", this.photos);

      this.container.querySelector("#mars-photo-count").textContent = this.photos.length;

      if (!this.photos.length) {
        gallery.innerHTML = `<div class="signal-lost">No photos found for this rover and sol.</div>`;
        return;
      }

      gallery.innerHTML = this.photos.slice(0, 36).map((photo) => `
        <article class="result-card">
          <label class="select-overlay">
            <input type="checkbox" data-photo="${photo.img_src}" />
            Select
          </label>
          <img src="${photo.img_src}" alt="${escapeHtml(photo.camera.full_name)}" loading="lazy" />
          <div>
            <h3>${escapeHtml(photo.camera.name)}</h3>
            <p>Sol ${photo.sol} · ${photo.earth_date}</p>
          </div>
        </article>
      `).join("");
    } catch (error) {
      gallery.innerHTML = `<div class="signal-lost">Mars rover signal unavailable.</div>`;
      state.addError("Mars Mission", error);
    }
  }

  async downloadSelected() {
    const selected = Array.from(this.container.querySelectorAll("[data-photo]:checked")).map((input) => input.dataset.photo);

    if (!selected.length) {
      alert("Select at least one Mars photo first.");
      return;
    }

    const zip = new JSZip();
    zip.file("README.txt", `COSMOS ULTRA Mars image list\n\n${selected.join("\n")}`);
    const blob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mars-${this.rover}-sol-${this.sol}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
