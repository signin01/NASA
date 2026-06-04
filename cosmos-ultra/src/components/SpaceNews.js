import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createSectionTitle, escapeHtml, formatDate } from "../core/utils.js";

export class SpaceNews {
  constructor(container) {
    this.container = container;
    this.type = "articles";
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("INTELLIGENCE FEED", "Space News Network")}

      <div class="section-toolbar">
        <button class="chip active" type="button" data-feed="articles">Articles</button>
        <button class="chip" type="button" data-feed="blogs">Blogs</button>
        <button class="chip" type="button" data-feed="reports">Reports</button>
      </div>

      <div id="news-grid" class="card-grid">
        ${Array.from({ length: 8 }, () => `<div class="mission-card skeleton-card"></div>`).join("")}
      </div>
    `;

    this.bind();
    this.load();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-feed]");
      if (!button) return;

      this.type = button.dataset.feed;
      this.container.querySelectorAll("[data-feed]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      this.load();
    });
  }

  async load() {
    const grid = this.container.querySelector("#news-grid");
    grid.innerHTML = Array.from({ length: 8 }, () => `<div class="mission-card skeleton-card"></div>`).join("");

    try {
      const method = this.type === "blogs"
        ? "getSpaceBlogs"
        : this.type === "reports"
          ? "getSpaceReports"
          : "getSpaceNews";

      const { data } = await api[method](12);
      const items = data.results || [];

      state.set("data.news", items);

      grid.innerHTML = items.map((item) => `
        <article class="mission-card">
          ${item.image_url ? `<img src="${item.image_url}" alt="${escapeHtml(item.title)}" loading="lazy" />` : ""}
          <div>
            <p class="section-kicker">${escapeHtml(item.news_site || "Spaceflight News")}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary || "").slice(0, 170)}</p>
            <a class="chip" href="${item.url}" target="_blank" rel="noreferrer">Read</a>
            <small>${formatDate(item.published_at)}</small>
          </div>
        </article>
      `).join("");
    } catch (error) {
      grid.innerHTML = `<div class="signal-lost">Space news signal unavailable.</div>`;
      state.addError("Space News", error);
    }
  }
}
