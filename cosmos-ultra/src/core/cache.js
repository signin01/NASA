class CosmosCache {
  constructor() {
    this.prefix = "cosmos_cache:";
    this.backupPrefix = "cosmos_backup:";
  }

  async get(key) {
    const safeKey = this.toKey(key);
    const sessionValue = sessionStorage.getItem(this.prefix + safeKey);
    if (sessionValue) {
      return JSON.parse(sessionValue);
    }

    const localValue = localStorage.getItem(this.backupPrefix + safeKey);
    if (localValue) {
      return JSON.parse(localValue);
    }

    return null;
  }

  async set(key, data) {
    const safeKey = this.toKey(key);
    const payload = JSON.stringify({
      data,
      timestamp: Date.now()
    });

    try {
      sessionStorage.setItem(this.prefix + safeKey, payload);
    } catch {
      this.prune(sessionStorage, this.prefix);
      sessionStorage.setItem(this.prefix + safeKey, payload);
    }

    try {
      localStorage.setItem(this.backupPrefix + safeKey, payload);
    } catch {
      this.prune(localStorage, this.backupPrefix);
    }
  }

  async remove(key) {
    const safeKey = this.toKey(key);
    sessionStorage.removeItem(this.prefix + safeKey);
    localStorage.removeItem(this.backupPrefix + safeKey);
  }

  clear() {
    this.clearByPrefix(sessionStorage, this.prefix);
    this.clearByPrefix(localStorage, this.backupPrefix);
  }

  isFresh(entry, ttl) {
    return Boolean(entry && Date.now() - entry.timestamp < ttl);
  }

  toKey(value) {
    return btoa(unescape(encodeURIComponent(value))).replaceAll("=", "");
  }

  clearByPrefix(storage, prefix) {
    Object.keys(storage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => storage.removeItem(key));
  }

  prune(storage, prefix) {
    const keys = Object.keys(storage).filter((key) => key.startsWith(prefix));
    keys.slice(0, Math.ceil(keys.length / 2)).forEach((key) => storage.removeItem(key));
  }
}

export const cache = new CosmosCache();
