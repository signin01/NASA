import { DEFAULT_SETTINGS } from "./constants.js";
import { eventBus } from "./events.js";

class AppState {
  constructor() {
    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      data: {
        iss: null,
        astronauts: [],
        kpIndex: null,
        solarWind: null,
        apod: null,
        asteroids: [],
        launches: [],
        news: [],
        exoplanets: [],
        marsPhotos: []
      },
      ui: {
        currentSection: "hero",
        isLoading: false,
        activeModal: null,
        isChatOpen: false,
        isSettingsOpen: false,
        bootComplete: false,
        errors: []
      }
    };

    this.listeners = new Map();
    this.loadFromStorage();
  }

  get(path = null) {
    if (!path) return this.state;
    return path.split(".").reduce((value, key) => value?.[key], this.state);
  }

  set(path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key] || typeof obj[key] !== "object") obj[key] = {};
      return obj[key];
    }, this.state);

    const previous = target[lastKey];
    target[lastKey] = value;

    this.notify(path, value, previous);

    if (path.startsWith("settings.")) {
      this.saveSettings();
      eventBus.emit("settings-change", this.state.settings);
    }
  }

  patch(path, value) {
    const current = this.get(path);
    this.set(path, { ...current, ...value });
  }

  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }

    this.listeners.get(path).add(callback);
    return () => this.listeners.get(path)?.delete(callback);
  }

  notify(path, value, previous) {
    const exact = this.listeners.get(path);
    if (exact) {
      exact.forEach((callback) => callback(value, previous));
    }

    this.listeners.forEach((callbacks, listenerPath) => {
      if (path.startsWith(listenerPath + ".")) {
        callbacks.forEach((callback) => callback(this.get(listenerPath), previous));
      }
    });
  }

  loadFromStorage() {
    try {
      const savedSettings = localStorage.getItem("cosmos_settings");
      if (savedSettings) {
        this.state.settings = {
          ...this.state.settings,
          ...JSON.parse(savedSettings)
        };
      }
    } catch (error) {
      console.warn("Could not load saved settings:", error);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem("cosmos_settings", JSON.stringify(this.state.settings));
    } catch (error) {
      console.warn("Could not save settings:", error);
    }
  }

  addError(source, error) {
    const entry = {
      id: crypto.randomUUID?.() || String(Date.now()),
      source,
      message: error?.message || String(error),
      timestamp: Date.now()
    };

    this.state.ui.errors = [entry, ...this.state.ui.errors].slice(0, 20);
    eventBus.emit("error", entry);
  }
}

export const state = new AppState();
