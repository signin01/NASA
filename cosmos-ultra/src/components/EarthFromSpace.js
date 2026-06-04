import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { createSectionTitle, formatDate } from "../core/utils.js";

export class EarthFromSpace {
  constructor(container) {
    this.container = container;
    this.images = [];
    this.index = 0;
    this.timer = null;
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      ${createSectionTitle("DSCOVR EPIC", "Live Earth From Space")}

      <div class="media-layout">
        <figure class="earth-frame">
          <img id="epic-image" alt="Latest EPIC Earth view" />
          <figcaption id="epic-caption">Connecting to EPIC camera...</figcaption>
        </figure>

        <aside class="side-panel">
          <h3>Image Controls</h3>
          <div class="control-stack">
            <button class="chip active" type="button" data-epic-play>Play</button>
            <button class="chip" type="button" data-epic-prev>Previous</button>
            <button class="chip" type="button" data-epic-next>Next</button>
            <a class="chip" id="epic-download" href="#" download>Download</a>
          </div>

          <div class="data-list">
            <p><span>Capture</span><strong id="epic-date">—</strong></p>
            <p><span>Centroid latitude</span><strong id="epic-lat">—</strong></p>
            <p><span>Centroid longitude</span><strong id="epic-lon">—</strong></p>
          </div>
        </aside>
      </div>
    `;

    this.bind();
    this.load();
  }

  bind() {
    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-epic-prev]")) this.show(this.index - 1);
      if (event.target.closest("[data-epic-next]")) this.show(this.index + 1);
      if (event.target.closest("[data-epic-play]")) this.togglePlayback(event.target.closest("[data-epic-play]"));
    });
  }

  async load() {
    try {
      const { data } = await api.getEPIC();
      this.images = Array.isArray(data) ? data : [];

      if (!this.images.length) {
        this.showFallback();
        return;
      }

      this.show(0);
      this.startPlayback();
    } catch (error) {
      this.showFallback();
      state.addError("Earth From Space", error);
    }
  }

  show(nextIndex) {
    if (!this.images.length) return;

    this.index = (nextIndex + this.images.length) % this.images.length;
    const item = this.images[this.index];
    const date = item.date.split(" ")[0];
    const [year, month, day] = date.split("-");
    const url = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${item.image}.png`;

    const image = this.container.querySelector("#epic-image");
    const caption = this.container.querySelector("#epic-caption");
    const download = this.container.querySelector("#epic-download");

    image.src = url;
    caption.textContent = item.caption || "EPIC natural color Earth image";
    download.href = url;

    this.container.querySelector("#epic-date").textContent = formatDate(item.date);
    this.container.querySelector("#epic-lat").textContent = `${Number(item.centroid_coordinates?.lat || 0).toFixed(2)} deg`;
    this.container.querySelector("#epic-lon").textContent = `${Number(item.centroid_coordinates?.lon || 0).toFixed(2)} deg`;
  }

  togglePlayback(button) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      button.textContent = "Play";
      button.classList.remove("active");
      return;
    }

    this.startPlayback();
    button.textContent = "Pause";
    button.classList.add("active");
  }

  startPlayback() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.show(this.index + 1), 3500);
  }

  showFallback() {
    const image = this.container.querySelector("#epic-image");
    const caption = this.container.querySelector("#epic-caption");

    image.removeAttribute("src");
    caption.textContent = "EPIC signal unavailable. Try again later.";
  }

  destroy() {
    clearInterval(this.timer);
  }
}
