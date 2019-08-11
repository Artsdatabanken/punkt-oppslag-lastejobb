#!/usr/bin/env node
const lastejobb = require("lastejobb");
const { log } = require("lastejobb");
const quadtree = require("./quadtree");
const filesystemwriter = require("./writer/filesystemwriter");
const Mbtileswriter = require("./writer/mbtileswriter");
const fs = require("fs");
const path = require("path");
const pkg = require("./package");
const geotiffreader = require("./reader/geotiffreader");
const converters = require("./converter");

log.info(pkg.name + " v" + pkg.version);
if (process.argv.length !== 4)
  return log.info(
    "Usage: node punkt-oppslag-lastejobb <dataDirectory> <datasetName/all>"
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
  layer.converter = converters[layer.mode || "gradient"];
  if (!layer.converter)
    return log.error(`Mode ${layer.mode} not supported.  Try class/gradient`);
  await processDataset(layer, tree);
}

function readConfig(basePath) {
  const tree = lastejobb.io.readJson(path.join(basePath, "config.json"));
  log.info("Bounds: " + JSON.stringify(tree.bounds));
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
  log.info("Zoom depth: " + layer.zoom);
  layer.resolution = tree.bounds.width * Math.pow(0.5, layer.zoom);
  log.info("Index resolution: " + layer.resolution + " meters");
  log.info("Reading: " + layer.source);
  await geotiffreader.buildQuadTileset(layer, tree);
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
  log.info(`Indexed ${stats.quadCount} tiles`);
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

  log.info(
    `Writing ${stats.quadCount - layer.pruneCount} tiles to ${buildPath}...`
  );
  //      filesystemwriter.write(tree, buildPath, layer);
  const mbtileswriter = new Mbtileswriter(buildPath);
  mbtileswriter.writeAll(tree, layer);
}
