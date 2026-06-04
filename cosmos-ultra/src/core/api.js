import { API_ENDPOINTS, CACHE_TTL, NASA_KEY, FALLBACK_CREW, MARS_VALID_SOLS } from "./constants.js";
import { cache } from "./cache.js";

const EXOPLANET_FALLBACK = [
  { pl_name: "Proxima Centauri b", pl_rade: "1.07", pl_orbper: "11.2",  pl_eqt: "234", st_dist: "1.3",  discoverymethod: "Radial Velocity" },
  { pl_name: "TRAPPIST-1e",        pl_rade: "0.92", pl_orbper: "6.1",   pl_eqt: "251", st_dist: "12.4", discoverymethod: "Transit" },
  { pl_name: "TRAPPIST-1f",        pl_rade: "1.04", pl_orbper: "9.2",   pl_eqt: "219", st_dist: "12.4", discoverymethod: "Transit" },
  { pl_name: "Kepler-442b",        pl_rade: "1.34", pl_orbper: "112.3", pl_eqt: "233", st_dist: "342",  discoverymethod: "Transit" },
  { pl_name: "Kepler-452b",        pl_rade: "1.63", pl_orbper: "384.8", pl_eqt: "265", st_dist: "430",  discoverymethod: "Transit" },
  { pl_name: "GJ 667 Cc",          pl_rade: "1.54", pl_orbper: "28.1",  pl_eqt: "277", st_dist: "6.8",  discoverymethod: "Radial Velocity" },
  { pl_name: "HD 40307g",          pl_rade: "2.40", pl_orbper: "197.8", pl_eqt: "226", st_dist: "13.0", discoverymethod: "Radial Velocity" },
  { pl_name: "Tau Ceti e",         pl_rade: "2.00", pl_orbper: "168.1", pl_eqt: "288", st_dist: "3.6",  discoverymethod: "Radial Velocity" },
  { pl_name: "LHS 1140b",          pl_rade: "1.43", pl_orbper: "24.7",  pl_eqt: "235", st_dist: "12.5", discoverymethod: "Transit" },
  { pl_name: "K2-18b",             pl_rade: "2.27", pl_orbper: "32.9",  pl_eqt: "265", st_dist: "124",  discoverymethod: "Transit" },
  { pl_name: "Ross 128b",          pl_rade: "1.10", pl_orbper: "9.9",   pl_eqt: "294", st_dist: "3.4",  discoverymethod: "Radial Velocity" },
  { pl_name: "Wolf 1061c",         pl_rade: "1.64", pl_orbper: "17.9",  pl_eqt: "272", st_dist: "4.3",  discoverymethod: "Radial Velocity" },
  { pl_name: "Kepler-62f",         pl_rade: "1.41", pl_orbper: "267.3", pl_eqt: "208", st_dist: "368",  discoverymethod: "Transit" },
  { pl_name: "Kepler-186f",        pl_rade: "1.17", pl_orbper: "129.9", pl_eqt: "188", st_dist: "178",  discoverymethod: "Transit" },
  { pl_name: "TRAPPIST-1d",        pl_rade: "0.77", pl_orbper: "4.05",  pl_eqt: "288", st_dist: "12.4", discoverymethod: "Transit" },
  { pl_name: "TRAPPIST-1g",        pl_rade: "1.13", pl_orbper: "12.4",  pl_eqt: "199", st_dist: "12.4", discoverymethod: "Transit" },
  { pl_name: "GJ 273b",            pl_rade: "1.51", pl_orbper: "18.6",  pl_eqt: "290", st_dist: "3.8",  discoverymethod: "Radial Velocity" },
  { pl_name: "TOI-700d",           pl_rade: "1.19", pl_orbper: "37.4",  pl_eqt: "268", st_dist: "31.1", discoverymethod: "Transit" },
  { pl_name: "Kepler-296e",        pl_rade: "1.53", pl_orbper: "34.1",  pl_eqt: "262", st_dist: "736",  discoverymethod: "Transit" },
  { pl_name: "Gliese 667Cc",       pl_rade: "1.54", pl_orbper: "28.1",  pl_eqt: "277", st_dist: "6.8",  discoverymethod: "Radial Velocity" }
];

class APIManager {
  constructor() {
    this.timeout = 9000;
    this.retryCount = 0;
  }

  async getAPOD(date = "") {
    const params = new URLSearchParams({ api_key: NASA_KEY });
    if (date) params.set("date", date);
    return this.fetchWithCache(`${API_ENDPOINTS.apod}?${params}`, CACHE_TTL.day);
  }

  async getNEO(startDate, endDate) {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, api_key: NASA_KEY });
    return this.fetchWithCache(`${API_ENDPOINTS.neo}?${params}`, CACHE_TTL.short);
  }

  async getMarsRoverPhotos(rover = "curiosity", sol = null, camera = "") {
    const safeSol = sol || MARS_VALID_SOLS[rover] || 3500;
    const solsToTry = [safeSol, safeSol - 100, safeSol + 100, 2000, 1500, 1000];
    for (const trySol of solsToTry) {
      try {
        const params = new URLSearchParams({ sol: trySol, api_key: NASA_KEY });
        if (camera) params.set("camera", camera);
        const result = await this.fetchWithCache(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?${params}`,
          CACHE_TTL.long
        );
        if (result.data?.photos?.length > 0) return result;
      } catch (_) {}
    }
    return { data: { photos: [] }, fromCache: false, cacheAge: 0 };
  }

  async getDONKI(type = "FLR", startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate, api_key: NASA_KEY });
    return this.fetchWithCache(`https://api.nasa.gov/DONKI/${type}?${params}`, CACHE_TTL.short);
  }

  async getEPIC() {
    return this.fetchWithCache("https://epic.gsfc.nasa.gov/api/natural", CACHE_TTL.long);
  }

  async searchNASAImages(query = "galaxy", mediaType = "image", page = 1) {
    const params = new URLSearchParams({ q: query, media_type: mediaType, page });
    return this.fetchWithCache(`${API_ENDPOINTS.nasaImages}?${params}`, CACHE_TTL.long);
  }

  async getISSPosition() {
    return this.fetchWithCache(API_ENDPOINTS.iss, CACHE_TTL.live);
  }

  async getISSTLE() {
    return this.fetchTextWithCache(API_ENDPOINTS.issTle, CACHE_TTL.medium);
  }

  async getAstronauts() {
    try {
      const result = await this.fetchWithCache(API_ENDPOINTS.astronauts, CACHE_TTL.short);
      if (result.data?.people?.length > 0) return result;
    } catch (_) {}
    try {
      const result = await this.fetchWithCache(API_ENDPOINTS.astronautsFallback, CACHE_TTL.short);
      if (result.data?.people?.length > 0) return result;
    } catch (_) {}
    return { data: FALLBACK_CREW, fromCache: false, cacheAge: 0, fallback: true };
  }

  async getUpcomingLaunches(limit = 10) {
    return this.fetchWithCache(`${API_ENDPOINTS.launchesUpcoming}?limit=${limit}`, CACHE_TTL.medium);
  }

  async getPreviousLaunches(limit = 10) {
    return this.fetchWithCache(`${API_ENDPOINTS.launchesPrevious}?limit=${limit}`, CACHE_TTL.medium);
  }

  async getSpaceNews(limit = 12) {
    return this.fetchWithCache(`${API_ENDPOINTS.spaceNews}?limit=${limit}`, CACHE_TTL.medium);
  }

  async getSpaceBlogs(limit = 8) {
    return this.fetchWithCache(`${API_ENDPOINTS.spaceBlogs}?limit=${limit}`, CACHE_TTL.medium);
  }

  async getSpaceReports(limit = 8) {
    return this.fetchWithCache(`${API_ENDPOINTS.spaceReports}?limit=${limit}`, CACHE_TTL.medium);
  }

  async getSpaceXLaunches() {
    return this.fetchWithCache(API_ENDPOINTS.spacexLaunches, CACHE_TTL.long);
  }

  async getSpaceXRockets() {
    return this.fetchWithCache(API_ENDPOINTS.spacexRockets, CACHE_TTL.long);
  }

  async getKpIndex() {
    return this.fetchWithCache(API_ENDPOINTS.noaaKp, CACHE_TTL.live);
  }

  async getSolarWind() {
    return this.fetchWithCache(API_ENDPOINTS.noaaWind, CACHE_TTL.live);
  }

  async getMagneticField() {
    return this.fetchWithCache(API_ENDPOINTS.noaaMag, CACHE_TTL.live);
  }

  async getNOAAAlerts() {
    return this.fetchWithCache(API_ENDPOINTS.noaaAlerts, CACHE_TTL.short);
  }

  async getGOESXray() {
    return this.fetchWithCache(API_ENDPOINTS.goesXray, CACHE_TTL.medium);
  }

  async getCloseApproaches(dateMin = "") {
    const params = new URLSearchParams({ "dist-max": "0.05", sort: "dist" });
    if (dateMin) params.set("date-min", dateMin);
    return this.fetchWithCache(`${API_ENDPOINTS.cad}?${params}`, CACHE_TTL.medium);
  }

  async getFireballs() {
    return this.fetchWithCache(API_ENDPOINTS.fireballs, CACHE_TTL.long);
  }

  async getScoutNEOs() {
    return this.fetchWithCache(API_ENDPOINTS.scout, CACHE_TTL.medium);
  }

  async getExoplanets(limit = 100) {
    return { data: EXOPLANET_FALLBACK.slice(0, limit), fromCache: false, cacheAge: 0, fallback: true };
  }

  async getCelestrakTLE(catnr = 25544) {
    return this.fetchTextWithCache(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${catnr}&FORMAT=TLE`, CACHE_TTL.medium);
  }

  async getActiveSatellites() {
    return this.fetchTextWithCache(API_ENDPOINTS.celestrakActive, CACHE_TTL.long);
  }

  async getSunriseSunset(lat, lon) {
    return this.fetchWithCache(`${API_ENDPOINTS.sunrise}?lat=${lat}&lng=${lon}&formatted=0`, CACHE_TTL.medium);
  }

  async getWeather(lat, lon) {
    return this.fetchWithCache(`${API_ENDPOINTS.weather}?latitude=${lat}&longitude=${lon}&current_weather=true`, CACHE_TTL.short);
  }

  async getWikipediaSummary(title) {
    return this.fetchWithCache(`${API_ENDPOINTS.wikipedia}/${encodeURIComponent(title)}`, CACHE_TTL.long);
  }

  async getIPGeolocation() {
    return this.fetchWithCache(API_ENDPOINTS.ipGeo, CACHE_TTL.long);
  }

  async reverseGeocode(lat, lon) {
    return this.fetchWithCache(`${API_ENDPOINTS.reverseGeo}?lat=${lat}&lon=${lon}&format=json`, CACHE_TTL.medium);
  }

  async fetchWithCache(url, ttl = CACHE_TTL.short) {
    return this.fetchCore(url, ttl, "json");
  }

  async fetchTextWithCache(url, ttl = CACHE_TTL.short) {
    return this.fetchCore(url, ttl, "text");
  }

  async fetchCore(url, ttl, responseType) {
    const cached = await cache.get(url);
    if (cache.isFresh(cached, ttl)) {
      return { data: cached.data, fromCache: true, cacheAge: Date.now() - cached.timestamp };
    }
    let lastError = null;
    for (let attempt = 0; attempt <= this.retryCount; attempt += 1) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: responseType === "json" ? "application/json,text/plain,*/*" : "text/plain,*/*" }
        });
        clearTimeout(timer);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = responseType === "json" ? await response.json() : await response.text();
        await cache.set(url, data);
        return { data, fromCache: false, cacheAge: 0 };
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    if (cached) {
      return { data: cached.data, fromCache: true, cacheAge: Date.now() - cached.timestamp, stale: true, error: lastError };
    }
    throw lastError;
  }
}

export const api = new APIManager();
window.api = api;
