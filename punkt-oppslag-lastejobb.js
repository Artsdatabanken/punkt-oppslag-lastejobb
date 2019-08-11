#!/usr/bin/env node
const lastejobb = require("lastejobb");
const { log } = require("lastejobb");
const GeoTIFF = require("geotiff");
const quadtree = require("./quadtree");
const geometry = require("./geometry");
const filesystemwriter = require("./writer/filesystemwriter");
const Mbtileswriter = require("./writer/mbtileswriter");
const fs = require("fs");
const path = require("path");
const pkg = require("./package");

log.info(pkg.name + " v" + pkg.version);
if (process.argv.length !== 4)
  return log.info(
    "Usage: node punkt-oppslag-lastejobb <dataDirectory> <datasetName>"
  );
const basePath = process.argv[2];
const layerName = process.argv[3];
processLayers(layerName, basePath);

async function processLayers(layerName, basePath) {
  if (layerName === "all") {
    const tree = readConfig(basePath);
    const tasks = Object.keys(tree.layers);
    for (var task of tasks) await processLayer(task, basePath);
  } else await processLayer(layerName, basePath);
}

async function processLayer(layerName, basePath) {
  const tree = readConfig(basePath);
  const layer = tree.layers[layerName];
  if (!layer)
    return log.warn(`Dataset ${layerName} not present in ${basePath}`);
  layer.name = layerName;
  await processDataset(layer, tree);
}

function readConfig(basePath) {
  const tree = lastejobb.io.readJson(path.join(basePath, "config.json"));
  log.info("Bounds:               " + JSON.stringify(tree.bounds));
  tree.bounds.width = tree.bounds.right - tree.bounds.left;
  tree.bounds.height = tree.bounds.top - tree.bounds.bottom;
  return tree;
}

async function processDataset(layer, tree) {
  log.info("Processing " + layer.name + "...");
  const buildPath = path.join(basePath, tree.buildPath);
  layer.mapFile = path.join(basePath, layer.source);
  const intervall = layer.intervall;
  intervall.original.bredde = intervall.original[1] - intervall.original[0];
  intervall.normalisertVerdi.bredde =
    intervall.normalisertVerdi[1] - intervall.normalisertVerdi[0];
  log.info("Zoom limit:           " + layer.zoom);
  log.info(
    "Effective resolution: " +
      tree.bounds.width * Math.pow(0.5, layer.zoom) +
      " meters"
  );
  log.info("Reading:           " + layer.source);
  await processTiff(layer, tree);
  // .then(x => {
  //      const coords = geometry.normalize([954000, 7940000, 0, 0], tree.bounds);
  if (layer.buildPyramid) {
    quadtree.addPyramid(tree, layer);
    log.info("Building pyramid...");
  }
  if (layer.buildVariance) {
    log.info("Calculating variance...");
    quadtree.statistics.variance.add(tree);
  }
  log.info("Pruning...");
  layer.pruneCount = quadtree.compact.pruneChildren(tree, layer);
  log.info("Pruned " + layer.pruneCount + " tiles.");
  //log.info("Quantizing");
  //      quadtree.compact.quantizeValues(tree);
  log.info("Generating summary");
  const stats = quadtree.statistics.summarize(tree);
  stats.quadCount = layer.quadCount;
  fs.writeFileSync(
    path.join(basePath, layer.name + "_stats.json"),
    JSON.stringify(stats)
  );

  log.info(`Writing ${stats.quadCount} tiles...`);
  //      filesystemwriter.write(tree, buildPath, layer);
  const mbtileswriter = new Mbtileswriter(buildPath);
  mbtileswriter.writeAll(tree, layer);
}

async function processTiff(layer, tree) {
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
  index(rasters[0], tree, bbox, width, height, layer);
}

function erNullverdi(value, nullverdier) {
  if (Array.isArray(nullverdier))
    for (let i = 0; i < nullverdier.length; i++)
      if (value === nullverdier[i]) return true;
  if (value === nullverdier) return true;
  return false;
}

function index(raster, tree, bbox, width, height, layer) {
  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++) {
      const offset = y * width + x;
      const value = raster[offset];
      if (erNullverdi(value, layer.nullverdi)) continue;
      const qvalue = quantize(layer.intervall, value);
      if (Math.round(qvalue) > layer.intervall.normalisertVerdi[1])
        throw new Error("Value out of range.  In:" + value + " Out:" + qvalue);
      const coords = getPixelCoords(bbox, x, y, width, height);
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

function getPixelCoords(bbox, x, y, width, height) {
  const metersPerPixelX = (bbox[2] - bbox[0]) / width;
  const metersPerPixelY = (bbox[3] - bbox[1]) / height;
  const coX = bbox[0] + x * metersPerPixelX;
  const coY = bbox[3] - y * metersPerPixelY;
  return [coX, coY - metersPerPixelY, coX + metersPerPixelX, coY];
}
