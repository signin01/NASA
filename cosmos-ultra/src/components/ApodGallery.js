import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createSectionTitle, escapeHtml, formatDate } from "../core/utils.js";

export class ApodGallery {
  constructor(container) {
    this.container = container;
    this.query = "nebula";
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("NASA VAULT", "APOD + Image Library")}

      <div class="apod-layout">
        <article class="apod-feature skeleton-card" id="apod-card">
          Loading today's astronomy picture...
        </article>

        <aside class="side-panel">
          <h3>Search NASA Images</h3>
          <form id="nasa-search" class="search-row">
            <input type="search" name="query" value="nebula" aria-label="NASA image search" />
            <button class="chip" type="submit">Search</button>
          </form>
          <div class="quick-searches">
            ${["Apollo", "Hubble", "Mars", "Saturn", "Black Hole", "Astronaut", "Rocket", "Earth", "Sun", "Nebula"].map((item) => `
              <button class="chip" type="button" data-query="${item}">${item}</button>
            `).join("")}
          </div>
        </aside>
      </div>

      <div id="nasa-results" class="media-grid"></div>
    `;

    this.bind();
    this.loadAPOD();
    this.searchImages();
  }

  bind() {
    this.container.addEventListener("submit", (event) => {
      if (event.target.id === "nasa-search") {
        event.preventDefault();
        this.query = event.target.elements.query.value || "nebula";
        this.searchImages();
      }
    });

    this.container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-query]");
      if (!button) return;

      this.query = button.dataset.query;
      this.container.querySelector("[name='query']").value = this.query;
      this.searchImages();
    });
  }

  async loadAPOD() {
    const card = this.container.querySelector("#apod-card");

    try {
      const { data } = await api.getAPOD();
      state.set("data.apod", data);

      const media = data.media_type === "video"
        ? `<iframe src="${data.url}" title="${escapeHtml(data.title)}" loading="lazy"></iframe>`
        : `<img src="${data.hdurl || data.url}" alt="${escapeHtml(data.title)}" loading="lazy" />`;

      card.classList.remove("skeleton-card");
      card.innerHTML = `
        <div class="apod-media">${media}</div>
        <div class="apod-copy">
          <p class="section-kicker">${formatDate(data.date, { dateStyle: "long", timeStyle: undefined })}</p>
          <h3>${escapeHtml(data.title)}</h3>
          <p>${escapeHtml(data.explanation || "").slice(0, 720)}</p>
          <div class="control-stack">
            <a class="chip" href="${data.hdurl || data.url}" target="_blank" rel="noreferrer">Open HD</a>
            <button class="chip" type="button" data-share-apod>Share</button>
          </div>
        </div>
      `;
    } catch (error) {
      card.classList.remove("skeleton-card");
      card.textContent = "APOD signal unavailable.";
      state.addError("APOD", error);
    }
  }

  async searchImages() {
    const grid = this.container.querySelector("#nasa-results");
    grid.innerHTML = Array.from({ length: 6 }, () => `<div class="result-card skeleton-card"></div>`).join("");

    try {
      const { data } = await api.searchNASAImages(this.query);
      const items = data.collection?.items || [];

      grid.innerHTML = items.slice(0, 12).map((item) => {
        const meta = item.data?.[0] || {};
        const link = item.links?.find((linkItem) => linkItem.render === "image")?.href || "";

        return `
          <article class="result-card">
            ${link ? `<img src="${link}" alt="${escapeHtml(meta.title || "NASA image")}" loading="lazy" />` : ""}
            <div>
              <h3>${escapeHtml(meta.title || "Untitled NASA Asset")}</h3>
              <p>${escapeHtml(meta.description || "").slice(0, 150)}</p>
              <small>${escapeHtml(meta.nasa_id || "")}</small>
            </div>
          </article>
        `;
      }).join("");
    } catch (error) {
      grid.innerHTML = `<div class="signal-lost">NASA image search unavailable.</div>`;
      state.addError("NASA Images", error);
    }
  }
}
