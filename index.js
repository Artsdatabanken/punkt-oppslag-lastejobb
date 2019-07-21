const GeoTIFF = require("geotiff");
const fs = require("fs");
const quadtree = require("./quadtree");
const geometry = require("./geometry");

const tree = {
  bounds: { left: -2500000, bottom: 3500000, right: 3045984, top: 9045984 }
};
tree.bounds.width = tree.bounds.right - tree.bounds.left;
tree.bounds.height = tree.bounds.top - tree.bounds.bottom;

const r = [];

async function processTiff() {
  const gt = await GeoTIFF.fromFile("./data/PCA1_32633.tif");
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
  index(rasters[0], bbox, width, height);
}

function index(raster, bbox, width, height) {
  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++) {
      const offset = y * width + x;
      const value = raster[offset];
      if (value === 0) continue;
      const coords = getPixelCoords(bbox, x, y, width, height);
      const xy = geometry.normalize(coords, tree.bounds);
      quadtree.add(tree, xy, 0, value);
      r.push({ coords, value });
    }
}

function getPixelCoords(bbox, x, y, width, height) {
  const metersPerPixelX = (bbox[2] - bbox[0]) / width;
  const metersPerPixelY = (bbox[3] - bbox[1]) / height;
  const coX = bbox[0] + x * metersPerPixelX;
  const coY = bbox[3] - y * metersPerPixelY;
  return [coX, coY - metersPerPixelY, coX + metersPerPixelX, coY];
}

processTiff().then(x => {
  fs.writeFileSync("x.json", JSON.stringify(r));
  fs.writeFileSync("tree.json", JSON.stringify(tree));
});
