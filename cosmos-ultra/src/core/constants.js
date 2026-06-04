export const NASA_KEY = "uFH8c5PU2hMJJY1UAxOYWXcTOLwMUc7EZVKLeJex";

export const APP_VERSION = "5.0.0";

export const THEMES = {
  cosmos: { label: "Cosmos", accent: "#00f5ff" },
  nebula: { label: "Nebula", accent: "#bf5fff" },
  solar:  { label: "Solar",  accent: "#ffd60a" },
  aurora: { label: "Aurora", accent: "#00ff88" },
  pulsar: { label: "Pulsar", accent: "#ff006e" }
};

export const SECTION_LINKS = [
  ["hero", "Control"],
  ["iss-tracker", "ISS"],
  ["earth-from-space", "Earth"],
  ["apod", "APOD"],
  ["asteroids", "NEO"],
  ["mars", "Mars"],
  ["solar-system", "Orrery"],
  ["space-weather", "Weather"],
  ["exoplanets", "Exoplanets"],
  ["launches", "Launches"],
  ["news", "News"],
  ["astronauts", "Crew"],
  ["physics", "Physics"],
  ["starmap", "Stars"],
  ["satellites", "Satellites"],
  ["quiz", "Quiz"],
  ["calendar", "Calendar"],
  ["encyclopedia", "Lexicon"],
  ["techlab", "Tech"],
  ["distance", "Scale"],
  ["chat", "Houston"],
  ["settings", "Settings"]
];

export const API_ENDPOINTS = {
  apod:               "https://api.nasa.gov/planetary/apod",
  neo:                "https://api.nasa.gov/neo/rest/v1/feed",
  epic:               "https://epic.gsfc.nasa.gov/api/natural",
  nasaImages:         "https://images-api.nasa.gov/search",
  iss:                "https://api.wheretheiss.at/v1/satellites/25544",
  issTle:             "https://api.wheretheiss.at/v1/satellites/25544/tles",
  astronauts:         "https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json",
  astronautsFallback: "https://api.open-notify.org/astros.json",
  launchesUpcoming:   "https://ll.thespacedevs.com/2.2.0/launch/upcoming",
  launchesPrevious:   "https://ll.thespacedevs.com/2.2.0/launch/previous",
  spaceNews:          "https://api.spaceflightnewsapi.net/v4/articles",
  spaceBlogs:         "https://api.spaceflightnewsapi.net/v4/blogs",
  spaceReports:       "https://api.spaceflightnewsapi.net/v4/reports",
  spacexLaunches:     "https://api.spacexdata.com/v4/launches",
  spacexRockets:      "https://api.spacexdata.com/v4/rockets",
  noaaKp:             "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
  noaaWind:           "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
  noaaMag:            "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
  noaaAlerts:         "https://services.swpc.noaa.gov/products/alerts.json",
  goesXray:           "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json",
  cad:                "https://ssd-api.jpl.nasa.gov/cad.api",
  fireballs:          "https://ssd-api.jpl.nasa.gov/fireball.api",
  scout:              "https://ssd-api.jpl.nasa.gov/scout.api",
  exoplanets:         "https://exoplanetarchive.ipac.caltech.edu/TAP/sync",
  celestrakIss:       "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
  celestrakActive:    "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=TLE",
  sunrise:            "https://api.sunrise-sunset.org/json",
  weather:            "https://api.open-meteo.com/v1/forecast",
  wikipedia:          "https://en.wikipedia.org/api/rest_v1/page/summary",
  ipGeo:              "https://ipapi.co/json",
  reverseGeo:         "https://nominatim.openstreetmap.org/reverse"
};

export const DEFAULT_SETTINGS = {
  theme: "cosmos",
  starDensity: 1500,
  units: "metric",
  soundEnabled: true,
  animationSpeed: 1,
  fontSize: "normal",
  blackoutMode: false,
  notificationsEnabled: false,
  autoRefresh: true,
  refreshInterval: 5000,
  scanlines: true,
  neon: 2,
  particles: true,
  threeD: true
};

export const CACHE_TTL = {
  live:   60 * 1000,
  short:  5  * 60 * 1000,
  medium: 30 * 60 * 1000,
  long:   6  * 60 * 60 * 1000,
  day:    24 * 60 * 60 * 1000
};

export const FALLBACK_CREW = {
  number: 7,
  people: [
    { name: "Oleg Kononenko",      craft: "ISS" },
    { name: "Nikolai Chub",        craft: "ISS" },
    { name: "Tracy Dyson",         craft: "ISS" },
    { name: "Matthew Dominick",    craft: "ISS" },
    { name: "Michael Barratt",     craft: "ISS" },
    { name: "Jeanette Epps",       craft: "ISS" },
    { name: "Alexander Grebenkin", craft: "ISS" }
  ]
};

export const MARS_VALID_SOLS = {
  curiosity:    3500,
  opportunity:  5000,
  perseverance: 800
};
