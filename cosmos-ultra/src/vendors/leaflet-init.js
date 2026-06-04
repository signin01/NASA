import L from "leaflet";

export function createDarkMap(containerId, options = {}) {
  const map = L.map(containerId, {
    zoomControl: true,
    attributionControl: true,
    ...options
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 12,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
  }).addTo(map);

  return map;
}

export function createIssIcon(label = "ISS") {
  return L.divIcon({
    className: "iss-marker",
    html: `<span>${label}</span>`,
    iconSize: [52, 32],
    iconAnchor: [26, 16]
  });
}

export function drawGroundTrack(map, positions, color = "#00f5ff") {
  return L.polyline(positions, {
    color,
    weight: 2,
    opacity: 0.85,
    dashArray: "6, 8"
  }).addTo(map);
}

export function drawFootprint(map, lat, lon, radiusKm, color = "#00f5ff") {
  return L.circle([lat, lon], {
    radius: radiusKm * 1000,
    color,
    weight: 1,
    opacity: 0.35,
    fillColor: color,
    fillOpacity: 0.05
  }).addTo(map);
}
