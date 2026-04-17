import { createCanvas, loadImage } from 'canvas';
import { isoContours } from 'marchingsquares';
import simplify from 'simplify-js';
import { parse } from "csv-parse";

async function extractRegions(colorMap) {
  const image = await loadImage(colorMap);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, image.width, image.height);

  const regions = new Map();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue; // ignore transparent

    const key = `${r},${g},${b}`;

    if (!regions.has(key)) {
      const mask = Array.from({ length: height }, () =>
        new Array(width).fill(0)
      );

      regions.set(key, mask);
    }

    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);

    regions.get(key)[y][x] = 1;
  }
  return [regions, width, height];
}

function extractPolygon(mask) {
  const contours = isoContours(
    mask,
    0.5,
    { noFrame: true }
  );

  // Use the largest contour (main region)
  contours.sort((a, b) => b.length - a.length);
  return contours[0];
}

function simplifyPolygon(polygon) {
  const points = polygon.map(([x, y]) => ({ x, y }));
  const simplified = simplify(points, 1.5, true);
  return simplified.map(p => [p.x, p.y]);
}

async function mapColorToRegion(keys, regionPolygons, dataCSV) {
  var regionData = []

  //const content = await fs.readFile(dataCSV);

  const records = parse(dataCSV, { bom: true });
  const data = await records.toArray()

  for(var i = 1; i < data.length; i++) {    
    if(keys.includes(data[i][0])) {
      const rgb = data[i][0]
      const name = data[i][1]
      const description = data[i][2]
      const vert = regionPolygons[data[i][0]]

      regionData.push({
        "name": name,
        "description": description,
        "vertices": vert
      })
    }
  }

  return regionData
}

export async function createRegions(colorMapImg, dataCSV) {
  const [regions, width, height] = await extractRegions(colorMapImg)
  const regionPolygons = {};

  for (const [color, mask] of regions) {
    const polygon = extractPolygon(mask);
    regionPolygons[color] = polygon;
  }

  var keys = []

  for (const key in regionPolygons) {
    keys.push(key)
    regionPolygons[key] = simplifyPolygon(regionPolygons[key]).flat();
  }

  const data = await mapColorToRegion(keys, regionPolygons, dataCSV)
  
  const regionsJson = {
    "width": width,
    "height": height,
    "regions": data
  }
  
  return regionsJson;
}



