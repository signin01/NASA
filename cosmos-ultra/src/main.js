import "./style.css";
import { state } from "./core/state.js";
import { eventBus } from "./core/events.js";
import { router } from "./core/router.js";
import { audio } from "./core/audio.js";
import { applyCosmosChartDefaults } from "./vendors/chart-init.js";

import { BootLoader } from "./components/BootLoader.js";
import { Starfield } from "./components/Starfield.js";
import { Navigation } from "./components/Navigation.js";
import { HeroSection } from "./components/HeroSection.js";
import { ISSTracker } from "./components/ISSTracker.js";
import { EarthFromSpace } from "./components/EarthFromSpace.js";
import { ApodGallery } from "./components/ApodGallery.js";
import { AsteroidHQ } from "./components/AsteroidHQ.js";
import { MarsMission } from "./components/MarsMission.js";
import { SolarSystem } from "./components/SolarSystem.js";
import { SpaceWeather } from "./components/SpaceWeather.js";
import { ExoplanetCommand } from "./components/ExoplanetCommand.js";
import { LaunchTracker } from "./components/LaunchTracker.js";
import { SpaceNews } from "./components/SpaceNews.js";
import { AstronautHall } from "./components/AstronautHall.js";
import { PhysicsSimulators } from "./components/PhysicsSimulators.js";
import { StarMap } from "./components/StarMap.js";
import { SatelliteTracker } from "./components/SatelliteTracker.js";
import { SpaceQuiz } from "./components/SpaceQuiz.js";
import { EventCalendar } from "./components/EventCalendar.js";
import { Encyclopedia } from "./components/Encyclopedia.js";
import { TechLab } from "./components/TechLab.js";
import { DistanceRuler } from "./components/DistanceRuler.js";
import { MissionChat } from "./components/MissionChat.js";
import { SettingsHub } from "./components/SettingsHub.js";

class CosmosUltra {
  constructor() {
    this.components = new Map();
    this.sectionMap = new Map([
      ["hero", HeroSection],
      ["iss-tracker", ISSTracker],
      ["earth-from-space", EarthFromSpace],
      ["apod", ApodGallery],
      ["asteroids", AsteroidHQ],
      ["mars", MarsMission],
      ["solar-system", SolarSystem],
      ["space-weather", SpaceWeather],
      ["exoplanets", ExoplanetCommand],
      ["launches", LaunchTracker],
      ["news", SpaceNews],
      ["astronauts", AstronautHall],
      ["physics", PhysicsSimulators],
      ["starmap", StarMap],
      ["satellites", SatelliteTracker],
      ["quiz", SpaceQuiz],
      ["calendar", EventCalendar],
      ["encyclopedia", Encyclopedia],
      ["techlab", TechLab],
      ["distance", DistanceRuler],
      ["chat", MissionChat],
      ["settings", SettingsHub]
    ]);
  }

  async init() {
    applyCosmosChartDefaults();
    this.applySettings();

    const boot = new BootLoader(document.getElementById("boot-loader"));
    await boot.show();

    this.initStarfield();
    this.initNavigation();
    router.init();
    this.initSections();
    this.initGlobalHandlers();
    this.initFab();
    this.initFooter();

    state.set("ui.bootComplete", true);
  }

  initStarfield() {
    const starfield = new Starfield(document.getElementById("starfield-canvas"));
    starfield.init();
    this.components.set("starfield", starfield);
  }

  initNavigation() {
    const navigation = new Navigation(document.getElementById("navbar"));
    navigation.init();
    this.components.set("navigation", navigation);
  }

  initSections() {
    this.mountSection("hero", document.getElementById("hero"));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        this.mountSection(entry.target.id, entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "120px 0px"
    });

    document.querySelectorAll(".section").forEach((section) => observer.observe(section));
  }

  mountSection(id, element) {
    if (!id || !element || this.components.has(id)) return;

    const Component = this.sectionMap.get(id);
    if (!Component) return;

    try {
      const instance = new Component(element);
      instance.init();
      this.components.set(id, instance);
    } catch (error) {
      state.addError(id, error);
      element.innerHTML =
        '<div class="signal-lost"><strong>SIGNAL LOST</strong><p>' +
        (error.message || "Component failed to initialize.") +
        "</p></div>";
    }
  }

  initGlobalHandlers() {
    eventBus.on("error", (entry) => {
      this.showToast("SIGNAL LOST: " + entry.source);
      audio.error();
    });

    eventBus.on("settings-change", () => this.applySettings());

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.getElementById("modal-root").innerHTML = "";
      }
    });

    if ("serviceWorker" in navigator && import.meta.env.PROD) { navigator.serviceWorker.register("/service-worker.js").catch(() => {}); }
  }

  initFab() {
    const fab = document.getElementById("fab");
    if (!fab) return;

    fab.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  initFooter() {
    const uptime = document.getElementById("uptime");
    const started = Date.now();

    setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const minutes = String(Math.floor(elapsed / 60) % 60).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");
      if (uptime) uptime.textContent = hours + ":" + minutes + ":" + seconds;
    }, 1000);
  }

  applySettings() {
    const settings = state.get("settings");
    document.documentElement.dataset.theme = settings.theme;
    document.body.classList.toggle("blackout", settings.blackoutMode);
    document.body.classList.toggle("scanlines", settings.scanlines);

    document.documentElement.style.fontSize =
      settings.fontSize === "small" ? "14px" :
      settings.fontSize === "large" ? "18px" :
      settings.fontSize === "xl" ? "20px" : "16px";
  }

  showToast(message) {
    const root = document.getElementById("toast-root");
    if (!root) return;

    const toast = document.createElement("div");
    toast.className = "toast visible";
    toast.textContent = message;
    root.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 4200);
  }
}

window.cosmosApp = new CosmosUltra();
window.cosmosApp.init();

