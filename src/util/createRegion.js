import { createCanvas, loadImage } from 'canvas';
import { isoContours } from 'marchingsquares';
import simplify from 'simplify-js';
import { parse } from "csv-parse";

const { Jimp } = require("jimp");

function parseRGB(key) {
  const [r, g, b] = key.split(',').map(Number);
  return [r, g, b];
}

function colorDistance(a, b) {
  const [r1, g1, b1] = parseRGB(a);
  const [r2, g2, b2] = parseRGB(b);
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

async function extractRegions(colorMap, numColors) {
  var image = await Jimp.read(colorMap);
  
  var image_post = image.quantize({colors: numColors}); 

  const { width, height } = image_post.bitmap;
  const data = image_post.bitmap.data;
  const channels = 4;

  const regions = new Map();

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128 ) continue; 

    const key = `${r},${g},${b}`;

    if (!regions.has(key)) {
      const mask = new Uint8Array(width * height);
      regions.set(key, mask);
    }

    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);

    regions.get(key)[y * width + x] = 2;
  }
  return [regions, width, height];
}

function polygonArea(poly) {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    area += (x1 * y2 - x2 * y1);
  }
  return Math.abs(area) / 2;
}

function extractPolygon(mask, width, height) {
  const grid = Array.from({ length: height }, (_, y) =>
    Array.from(mask.subarray(y * width, y * width + width)).map(v => v === 2 ? 0 : 2)
  );

  const contours = isoContours(
    grid,
    1.5,
    { noFrame: false }
  );

  contours.sort((a, b) => polygonArea(a) - polygonArea(b));
  return contours[0];
}

function simplifyPolygon(polygon) {
  const points = polygon.map(([x, y]) => ({ x, y }));
  const simplified = simplify(points, 1.5, true);
  return simplified.map(p => [p.x, p.y]);
}

async function mapColorToRegion(keys, regionPolygons, data) {
  var regionData = []

  for(var i = 1; i < data.length; i++) { 
    const nearest = keys.reduce((best, keyColor) =>
      colorDistance(data[i][0], keyColor) < colorDistance(data[i][0], best) ? keyColor : best
    );
    
    const rgb = nearest
    const name = data[i][1]
    const description = data[i][2]
    const mission = data[i][3]
    const level = data[i][4]
    const reward = data[i][5]
    const vert = regionPolygons[nearest]

    regionData.push({
      "name": name,
      "description": description,
      "vertices": vert,
      "color": rgb,
      "mission": mission,
      "level": level,
      "reward": reward
    })
    
  }


  return regionData
}

export async function createRegions(colorMapImg, dataCSV) {
  const records = parse(dataCSV, { bom: true });
  const data = await records.toArray()

  const [regions, width, height] = await extractRegions(colorMapImg, data.length)
  const regionPolygons = {};

  for (const [color, mask] of regions) {
    const polygon = extractPolygon(mask, width, height);
    regionPolygons[color] = simplifyPolygon(polygon).flat();
  }

  var keys = Object.keys(regionPolygons);
  const region_data = await mapColorToRegion(keys, regionPolygons, data)
  
  const regionsJson = {
    "width": width,
    "height": height,
    "regions": region_data
  }

  return regionsJson;
}



