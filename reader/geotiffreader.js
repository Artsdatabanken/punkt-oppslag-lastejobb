const { log } = require("lastejobb");
const GeoTIFF = require("geotiff");
const geometry = require("../geometry");
const quadtree = require("../quadtree");

async function buildQuadTileset(layer, tree) {
  const gt = await GeoTIFF.fromFile(layer.mapFile);
  const imageCount = await gt.getImageCount();
  if (imageCount !== 1)
    throw new Error("Can only handle GeoTiff containing single image.");
  const image = await gt.getImage(0);
  const bbox = image.getBoundingBox();
  const width = image.getWidth();
  const height = image.getHeight();
  const rasters = await image.readRasters();
  if (rasters.length !== 1)
    throw new Error("Can only handle GeoTiff containing single raster.");
  log.info("Indexing " + width + "x" + height + " raster");
  log.info("Image resolution: " + (bbox[2] - bbox[0]) / width + " meters");
  index(rasters[0], tree, bbox, width, height, layer);
}

function erNullverdi(value, nullverdier) {
  if (Array.isArray(nullverdier)) {
    for (let i = 0; i < nullverdier.length; i++)
      if (value === nullverdier[i]) return true;
  } else if (value === nullverdier) return true;
  return false;
}

function index(raster, tree, bbox, width, height, layer) {
  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++) {
      const value = raster[y * width + x];
      if (erNullverdi(value, layer.nullverdi)) continue;
      const qvalue = quantize(layer.intervall, value);
      if (Math.round(qvalue) > layer.intervall.normalisertVerdi[1])
        throw new Error("Value out of range.  In:" + value + " Out:" + qvalue);
      const coords = pixelToWorldCoordinates(bbox, x, y, width, height);
      const xy = geometry.normalize(coords, tree.bounds);
      const cursor = { bounds: xy, zoom: 0, targetZoom: layer.zoom };
      quadtree.add(tree, cursor, layer, value);
    }
}

function quantize(intervall, value) {
  return (
    ((value - intervall.original[0]) / intervall.original.bredde) *
      intervall.normalisertVerdi.bredde +
    intervall.normalisertVerdi[0]
  );
}

function pixelToWorldCoordinates(bbox, x, y, width, height) {
  const metersPerPixelX = (bbox[2] - bbox[0]) / width;
  const metersPerPixelY = (bbox[3] - bbox[1]) / height;
  const coX = bbox[0] + x * metersPerPixelX;
  const coY = bbox[3] - y * metersPerPixelY;
  return [coX, coY - metersPerPixelY, coX + metersPerPixelX, coY];
}

module.exports = { buildQuadTileset };
