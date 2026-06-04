import eventsData from "../data/events.json";
import { createSectionTitle, formatDate } from "../core/utils.js";

export class EventCalendar {
  constructor(container) {
    this.container = container;
    this.current = new Date();
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("CELESTIAL SCHEDULE", "Cosmic Event Calendar")}

      <div class="calendar-toolbar">
        <button class="chip" type="button" data-prev-month>←</button>
        <h3 id="calendar-title"></h3>
        <button class="chip" type="button" data-next-month>→</button>
      </div>

      <div id="calendar-grid" class="calendar-grid"></div>
      <div id="event-list" class="event-list"></div>
    `;

    this.bind();
    this.render();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-prev-month]")) {
        this.current.setMonth(this.current.getMonth() - 1);
        this.render();
      }

      if (event.target.closest("[data-next-month]")) {
        this.current.setMonth(this.current.getMonth() + 1);
        this.render();
      }

      const day = event.target.closest("[data-day]");
      if (day) this.renderEventsForDate(day.dataset.day);
    });
  }

  render() {
    const year = this.current.getFullYear();
    const month = this.current.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());

    this.container.querySelector("#calendar-title").textContent = this.current.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });

    const cells = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = date.toISOString().slice(0, 10);
      const events = eventsData.events.filter((item) => item.date.slice(0, 10) === iso);
      const outside = date.getMonth() !== month;
      const today = iso === new Date().toISOString().slice(0, 10);

      return `
        <button class="calendar-cell ${outside ? "muted" : ""} ${today ? "today" : ""}" type="button" data-day="${iso}">
          <span>${date.getDate()}</span>
          <small>${events.slice(0, 3).map((item) => `<i title="${item.name}"></i>`).join("")}</small>
          ${events.length > 3 ? `<em>+${events.length - 3}</em>` : ""}
        </button>
      `;
    });

    this.container.querySelector("#calendar-grid").innerHTML = cells.join("");
    this.renderEventsForDate(new Date().toISOString().slice(0, 10));
  }

  renderEventsForDate(iso) {
    const target = this.container.querySelector("#event-list");
    const matches = eventsData.events.filter((event) => event.date.slice(0, 10) === iso);

    target.innerHTML = matches.length
      ? matches.map((event) => `
          <article class="alert-card">
            <strong>${event.name}</strong>
            <p>${event.type} · ${formatDate(event.date)}</p>
            <p>${event.description}</p>
          </article>
        `).join("")
      : `<article class="alert-card ok">No logged cosmic events for ${iso}.</article>`;
  }
}
