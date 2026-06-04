import { state } from "./state.js";

class Router {
  constructor() {
    this.sections = [];
  }

  init() {
    this.sections = Array.from(document.querySelectorAll(".section"));

    window.addEventListener("hashchange", () => this.handleHash());
    this.handleHash();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          state.set("ui.currentSection", visible.target.id);
          history.replaceState(null, "", `#${visible.target.id}`);
        }
      },
      {
        threshold: [0.15, 0.4, 0.7],
        rootMargin: "-80px 0px -40% 0px"
      }
    );

    this.sections.forEach((section) => observer.observe(section));
  }

  handleHash() {
    const id = window.location.hash.replace("#", "") || "hero";
    const target = document.getElementById(id);

    if (target) {
      this.go(id, false);
    }
  }

  go(id, updateHash = true) {
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    state.set("ui.currentSection", id);

    if (updateHash) {
      history.pushState(null, "", `#${id}`);
    }
  }
}

export const router = new Router();
