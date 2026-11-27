import type { Factory } from "./factoryCatalog";

// Projected SGIS administrative boundaries, simplified from vuski/admdongkor (2026-10-01, CC BY 4.0).
export const districtViewport = { x: 69, y: 31, width: 528, height: 440 } as const;

export const mapDongs = [
  { name: "회기동", points: "340.8,124.4 344.7,128.8 357.6,159.3 360.6,177.2 372.7,194.8 346.0,229.3 339.5,224.0 316.1,216.6 312.5,205.6 310.6,168.8 312.1,154.8 315.4,144.3 329.3,114.9 334.1,111.1 336.2,110.6" },
  { name: "휘경1동", points: "456.1,166.4 460.8,186.3 373.3,218.3 359.9,224.8 349.0,224.9 372.7,194.8 378.9,183.7 403.7,180.3 422.0,168.4 426.6,162.7" },
  { name: "휘경2동", points: "463.2,199.2 469.1,223.7 505.9,281.3 493.5,281.2 449.9,270.6 440.6,271.7 421.3,264.5 421.9,251.3 415.9,246.8 406.4,243.9 403.9,243.8 397.4,247.1 379.1,247.2 378.1,240.5 376.7,239.1 369.2,237.2 367.0,239.9 366.7,246.1 359.7,254.2 359.9,224.8 373.3,218.3 460.8,186.3" },
  { name: "청량리동", points: "312.1,154.8 310.6,168.8 312.5,205.6 316.1,216.6 339.5,224.0 346.0,229.3 327.9,256.6 302.6,281.6 284.7,291.4 283.9,278.4 288.9,278.2 277.7,233.8 264.7,234.4 259.7,218.7 266.4,206.7 265.8,202.1 261.9,196.4 255.9,196.2 266.9,158.8 285.0,149.6" },
  { name: "신설동", points: "195.3,279.3 198.8,305.2 201.2,340.1 226.4,339.1 228.2,345.6 234.0,350.7 238.9,351.5 229.9,356.0 211.6,371.0 198.8,373.6 153.1,357.8 151.7,305.6 160.3,296.1 193.2,266.9" },
  { name: "제기동", points: "284.7,291.4 278.4,294.9 253.7,304.1 237.1,305.4 215.0,305.0 214.6,298.3 207.2,278.3 195.3,279.3 193.2,266.9 238.3,207.4 239.0,196.4 261.9,196.4 265.8,202.1 266.4,206.7 259.7,218.7 264.7,234.4 277.7,233.8 288.9,278.2 283.9,278.4" },
  { name: "전농1동", points: "359.7,254.2 350.9,260.9 377.6,307.7 377.5,327.9 355.2,342.6 342.1,344.3 332.0,337.0 316.7,337.9 309.3,348.9 298.2,338.9 294.2,311.3 283.4,303.2 278.4,294.9 302.6,281.6 320.7,263.8 327.9,256.6 349.0,224.9 359.9,224.8" },
  { name: "전농2동", points: "447.9,270.8 443.3,299.7 438.9,317.6 421.7,318.9 393.3,326.8 377.5,327.9 377.6,307.7 350.9,260.9 364.2,250.1 366.7,246.1 367.0,239.9 369.2,237.2 376.7,239.1 378.1,240.5 379.1,247.2 397.4,247.1 403.9,243.8 415.9,246.8 421.9,251.3 421.3,264.5 440.6,271.7" },
  { name: "답십리2동", points: "434.4,349.3 426.9,364.8 400.5,408.9 378.4,429.9 372.3,423.7 373.3,388.5 377.5,327.9 393.3,326.8 421.7,318.9 438.9,317.6" },
  { name: "장안1동", points: "514.7,356.8 509.4,371.5 472.3,454.5 463.1,450.0 429.3,443.7 429.1,445.4 389.0,436.4 384.5,434.5 378.4,429.9 400.5,408.9 426.9,364.8 434.4,349.3 464.7,352.3 467.8,357.2 450.5,391.3 468.0,391.8 474.5,390.4 483.7,368.0 487.6,354.3" },
  { name: "장안2동", points: "505.9,281.3 513.0,316.1 514.7,356.8 487.6,354.3 483.7,368.0 474.5,390.4 468.0,391.8 450.5,391.3 467.8,357.2 464.7,352.3 434.4,349.3 438.9,317.6 443.3,299.7 447.9,270.8 493.5,281.2" },
  { name: "이문1동", points: "457.4,142.7 456.1,166.4 426.6,162.7 422.0,168.4 403.7,180.3 378.9,183.7 372.7,194.8 360.6,177.2 357.6,159.3 344.7,128.8 340.8,124.4 375.0,113.7 393.3,106.7 398.1,94.5 406.4,111.3 406.0,121.9 448.3,141.8" },
  { name: "이문2동", points: "469.8,67.7 476.2,101.0 475.9,110.2 471.5,121.4 457.4,142.7 448.3,141.8 406.0,121.9 406.4,111.3 398.1,94.5 408.3,80.4 425.6,75.5 433.9,75.9 450.2,67.2 449.3,47.0 454.3,46.9" },
  { name: "답십리1동", points: "377.5,327.9 373.3,388.5 372.3,423.7 318.7,373.3 276.3,347.2 294.2,311.3 298.2,338.9 309.3,348.9 316.7,337.9 332.0,337.0 342.1,344.3 355.2,342.6" },
  { name: "용두동", points: "238.9,351.5 234.0,350.7 228.2,345.6 226.4,339.1 201.2,340.1 198.8,305.2 195.3,279.3 207.2,278.3 214.6,298.3 215.0,305.0 237.1,305.4 253.7,304.1 278.4,294.9 283.4,303.2 294.2,311.3 276.3,347.2 248.4,348.2" },
];

export const mapLabels = [
  { name: "회기동", x: 336.7, y: 176.1 },
  { name: "휘경동", x: 435.2, y: 235.6 },
  { name: "청량리동", x: 295.5, y: 215.5 },
  { name: "신설동", x: 184.5, y: 330.2 },
  { name: "제기동", x: 243.9, y: 259.0 },
  { name: "전농동", x: 400.5, y: 283.5 },
  { name: "답십리동", x: 395, y: 385 },
  { name: "장안동", x: 449.3, y: 403.3 },
  { name: "이문동", x: 436, y: 98 },
  { name: "용두동", x: 242.1, y: 320.6 },
];

// Use the same outlines for pin placement and for drawing the map.
const rings = mapDongs.map(({ points }) =>
  points.split(" ").map((pair) => pair.split(",").map(Number)),
);

function containsPoint(ring: number[][], x: number, y: number) {
  let inside = false;
  for (let i = 0, previous = ring.length - 1; i < ring.length; previous = i++) {
    const [ax, ay] = ring[previous];
    const [bx, by] = ring[i];
    const cross = (x - ax) * (by - ay) - (y - ay) * (bx - ax);
    if (
      Math.abs(cross) < 1e-7 &&
      x >= Math.min(ax, bx) && x <= Math.max(ax, bx) &&
      y >= Math.min(ay, by) && y <= Math.max(ay, by)
    ) return true;

    if ((ay > y) !== (by > y) && x < ax + ((y - ay) * (bx - ax)) / (by - ay)) {
      inside = !inside;
    }
  }
  return inside;
}

export function getDistrictPinPosition(lng: number, lat: number) {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  const x = (lng - 127) * 6550;
  const y = (37.615 - lat) * 8270;
  const district = rings.findIndex(ring => containsPoint(ring, x, y));
  if (district < 0) return null;
  return {
    districtName: mapDongs[district].name, lng, lat,
    x: ((x - districtViewport.x) / districtViewport.width) * 100,
    y: ((y - districtViewport.y) / districtViewport.height) * 100,
  };
}

export type MapMode = "district" | "position";
export type LocatedFactory = Pick<Factory, "lat" | "lng" | "region" | "admin_district">;
export type FactoryPin<T extends LocatedFactory = Factory> = { key: string; label: string; districtName?: string; x: number; y: number; lat: number; lng: number; factories: T[] };

// A district pin represents the registered neighbourhood, not the workshop address.
const districtPositions = new Map(mapLabels.map(({ name, x, y }) => [name, {
  lng: 127 + x / 6550,
  lat: 37.615 - y / 8270,
  x: ((x - districtViewport.x) / districtViewport.width) * 100,
  y: ((y - districtViewport.y) / districtViewport.height) * 100,
}]));

export function groupDistrictFactories<T extends LocatedFactory>(rows: T[], mode: MapMode) {
  const groups = new Map<string, FactoryPin<T>>();
  for (const factory of rows) {
    const district = (factory.admin_district || factory.region || "").replace(/\s/g, "").replace(/(?:동)?제?\d+동$/, "동");
    const key = mode === "district" ? district : `${factory.lng},${factory.lat}`;
    const position = mode === "district" ? districtPositions.get(district) : getDistrictPinPosition(factory.lng, factory.lat);
    if (!position) continue;
    const group: FactoryPin<T> = groups.get(key) ?? {
      key, label: mode === "district" ? district : "이 위치", ...position, factories: [],
    };
    group.factories.push(factory);
    groups.set(key, group);
  }
  return [...groups.values()];
}
