const lastejobb = require("lastejobb");
const GeoTIFF = require("geotiff");
const quadtree = require("./quadtree");
const geometry = require("./geometry");
const filesystemwriter = require("./filesystemwriter");

const tree = {
  bounds: { left: -2500000, bottom: 3500000, right: 3045984, top: 9045984 }
};
tree.bounds.width = tree.bounds.right - tree.bounds.left;
tree.bounds.height = tree.bounds.top - tree.bounds.bottom;

async function processTiff(meta) {
  const gt = await GeoTIFF.fromFile(meta.mapFile);
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
  index(rasters[0], bbox, width, height, meta);
}

function index(raster, bbox, width, height, meta) {
  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++) {
      const offset = y * width + x;
      const value = raster[offset];
      if (value === meta.nullverdi) continue;
      const qvalue = quantize(meta.intervall, value);
      if (qvalue > meta.intervall.normalisertVerdi[1]) {
        console.log(value, qvalue);
        debugger;
      }
      const coords = getPixelCoords(bbox, x, y, width, height);
      const xy = geometry.normalize(coords, tree.bounds);
      quadtree.add(tree, xy, meta.zoom, qvalue);
      // r.push({ coords, value });
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

function processDataset(metaPath) {
  const meta = lastejobb.io.readJson(metaPath);
  meta.mapFile = metaPath.replace(".json", ".tif");
  const intervall = meta.intervall;
  intervall.original.bredde = intervall.original[1] - intervall.original[0];
  intervall.normalisertVerdi.bredde =
    intervall.normalisertVerdi[1] - intervall.normalisertVerdi[0];
  console.log("Zoom limit:           " + meta.zoom);
  console.log(
    "Effective resolution: " +
      tree.bounds.width * Math.pow(0.5, meta.zoom) +
      " meters"
  );
  processTiff(meta).then(x => {
    const coords = geometry.normalize([954000, 7940000, 0, 0], tree.bounds);
    quadtree.compact.equalChildren(tree);
    quadtree.addPyramid(tree);
    quadtree.compact.removeP(tree);
    quadtree.compact.quantizeValues(tree);
    const stats = quadtree.statistics.summarize(tree);
    console.log(quadtree.find(tree, coords[0], coords[1], 42));
    filesystemwriter.write(tree, "./data", meta);
    //    fs.writeFileSync("stats.json", JSON.stringify(stats));
    //    fs.writeFileSync("x.json", JSON.stringify(r));
    //    fs.writeFileSync("tree.json", JSON.stringify(tree));
  });
}

//processDataset("data/NA-LKM-S3-F.json");
//processDataset("data/KLG-BP.json");
//processDataset("data/KLG-KA.json");
processDataset("data/NN-LA-KLG-AI.json");
