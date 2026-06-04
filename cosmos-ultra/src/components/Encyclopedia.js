import glossaryData from "../data/glossary.json";
import { createSectionTitle, escapeHtml } from "../core/utils.js";

export class Encyclopedia {
  constructor(container) {
    this.container = container;
    this.terms = glossaryData.terms || [];
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("SPACE LEXICON", "Space Encyclopedia")}

      <div class="section-toolbar">
        <input id="glossary-search" class="search-input" type="search" placeholder="Search terms..." aria-label="Search encyclopedia" />
        <select id="glossary-category" class="select-control" aria-label="Filter category">
          <option value="all">All categories</option>
          ${[...new Set(this.terms.map((term) => term.category))].map((category) => `
            <option value="${category}">${category}</option>
          `).join("")}
        </select>
        <button class="chip" type="button" data-flashcard>Flashcard</button>
      </div>

      <article id="term-of-day" class="side-panel"></article>
      <div id="glossary-grid" class="card-grid"></div>
    `;

    this.bind();
    this.renderTermOfDay();
    this.render();
  }

  bind() {
    this.container.querySelector("#glossary-search").addEventListener("input", () => this.render());
    this.container.querySelector("#glossary-category").addEventListener("change", () => this.render());

    this.container.addEventListener("click", (event) => {
      const card = event.target.closest("[data-term]");
      if (card) this.showTerm(card.dataset.term);

      if (event.target.closest("[data-flashcard]")) {
        this.showFlashcard();
      }
    });
  }

  getFilteredTerms() {
    const query = this.container.querySelector("#glossary-search").value.trim().toLowerCase();
    const category = this.container.querySelector("#glossary-category").value;

    return this.terms.filter((term) => {
      const matchesQuery = !query || term.term.toLowerCase().includes(query) || term.definition.toLowerCase().includes(query);
      const matchesCategory = category === "all" || term.category === category;
      return matchesQuery && matchesCategory;
    });
  }

  render() {
    const grid = this.container.querySelector("#glossary-grid");
    const terms = this.getFilteredTerms();

    grid.innerHTML = terms.map((term) => `
      <article class="mission-card glossary-card" data-term="${escapeHtml(term.term)}">
        <div>
          <p class="section-kicker">${escapeHtml(term.category)} | Level ${term.difficulty || 1}</p>
          <h3>${escapeHtml(term.term)}</h3>
          <p>${escapeHtml(term.definition).slice(0, 170)}</p>
        </div>
      </article>
    `).join("");
  }

  renderTermOfDay() {
    const target = this.container.querySelector("#term-of-day");
    if (!this.terms.length) {
      target.textContent = "Glossary data pending.";
      return;
    }

    const daySeed = Math.floor(Date.now() / 86400000);
    const term = this.terms[daySeed % this.terms.length];

    target.innerHTML = `
      <p class="section-kicker">TERM OF THE DAY</p>
      <h3>${escapeHtml(term.term)}</h3>
      <p>${escapeHtml(term.definition)}</p>
    `;
  }

  showTerm(termName) {
    const term = this.terms.find((item) => item.term === termName);
    if (!term) return;

    const modalRoot = document.getElementById("modal-root");
    modalRoot.innerHTML = `
      <div class="modal open">
        <article class="modal-card">
          <button class="modal-close" type="button" aria-label="Close">x</button>
          <p class="section-kicker">${escapeHtml(term.category)}</p>
          <h3>${escapeHtml(term.term)}</h3>
          <p>${escapeHtml(term.definition)}</p>
          <p><strong>Example:</strong> ${escapeHtml(term.example || "No example listed.")}</p>
          <p><strong>Fact:</strong> ${escapeHtml(term.funFact || "No fact listed.")}</p>
        </article>
      </div>
    `;

    modalRoot.querySelector(".modal-close").addEventListener("click", () => {
      modalRoot.innerHTML = "";
    });
  }

  showFlashcard() {
    const term = this.getFilteredTerms()[0] || this.terms[0];
    if (term) this.showTerm(term.term);
  }
}
