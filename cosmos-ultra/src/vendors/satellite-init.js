import * as satellite from "satellite.js";

export function parseTle(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const line1Index = lines.findIndex((line) => line.startsWith("1 "));
  const line1 = lines[line1Index];
  const line2 = lines[line1Index + 1];
  const name = line1Index > 0 ? lines[line1Index - 1] : "Satellite";

  if (!line1 || !line2) {
    throw new Error("Invalid TLE text");
  }

  return {
    name,
    line1,
    line2,
    satrec: satellite.twoline2satrec(line1, line2)
  };
}

export function propagateNow(tle) {
  const now = new Date();
  const positionAndVelocity = satellite.propagate(tle.satrec, now);

  if (!positionAndVelocity.position) {
    throw new Error("SGP4 propagation returned no position");
  }

  const gmst = satellite.gstime(now);
  const geo = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

  return {
    latitude: satellite.degreesLat(geo.latitude),
    longitude: satellite.degreesLong(geo.longitude),
    altitude: geo.height
  };
}

export function generateGroundTrack(tle, minutes = 90, stepMinutes = 5) {
  const points = [];

  for (let minute = -minutes; minute <= minutes; minute += stepMinutes) {
    const date = new Date(Date.now() + minute * 60000);
    const positionAndVelocity = satellite.propagate(tle.satrec, date);
    if (!positionAndVelocity.position) continue;

    const gmst = satellite.gstime(date);
    const geo = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

    points.push([
      satellite.degreesLat(geo.latitude),
      satellite.degreesLong(geo.longitude)
    ]);
  }

  return points;
}
