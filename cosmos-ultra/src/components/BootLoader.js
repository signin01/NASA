export class BootLoader {
  constructor(container) {
    this.container = container;
    this.lines = [
      "[BOOT] COSMOS ULTRA v5.0",
      "[OK] STARFIELD ENGINE ONLINE",
      "[OK] NASA API HANDSHAKE READY",
      "[OK] ORBITAL TELEMETRY BUS LINKED",
      "[OK] DEEP SPACE CACHE PRIMED",
      "[OK] MISSION CONTROL INTERFACE ARMED"
    ];
  }

  async show() {
    if (!this.container) return;

    const hasVisited = localStorage.getItem("cosmos_boot_seen") === "true";

    if (hasVisited) {
      await this.showMiniLoader();
      return;
    }

    this.container.innerHTML = `
      <div class="boot-shell">
        <div class="orbit-spinner" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <pre class="boot-terminal"></pre>
        <div class="boot-progress">
          <span></span>
        </div>
        <button class="boot-skip" type="button">Skip</button>
      </div>
    `;

    const terminal = this.container.querySelector(".boot-terminal");
    const progress = this.container.querySelector(".boot-progress span");
    const skip = this.container.querySelector(".boot-skip");

    let skipped = false;
    skip.addEventListener("click", () => {
      skipped = true;
      this.complete();
    });

    for (let index = 0; index < this.lines.length; index += 1) {
      if (skipped) return;
      await this.typeLine(terminal, this.lines[index]);
      progress.style.width = `${Math.round(((index + 1) / this.lines.length) * 100)}%`;
      await this.wait(120);
    }

    await this.wait(450);
    this.complete();
  }

  async showMiniLoader() {
    this.container.innerHTML = `
      <div class="mini-loader">
        <div class="orbit-spinner" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

    await this.wait(750);
    this.complete(false);
  }

  async typeLine(target, text) {
    for (const char of text) {
      target.textContent += char;
      await this.wait(24);
    }

    target.textContent += "\n";
  }

  complete(storeVisit = true) {
    if (storeVisit) localStorage.setItem("cosmos_boot_seen", "true");
    this.container.classList.add("boot-complete");

    setTimeout(() => {
      this.container.remove();
    }, 520);
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
