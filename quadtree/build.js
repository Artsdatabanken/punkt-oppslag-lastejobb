const geometry = require("../geometry");

const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};

function addChild(tree, dir, bounds, meta, value) {
  const z = meta.zoom;
  bounds = geometry.clipToBounds(bounds, quadBound[dir]);
  if (!hasArea(bounds, z)) return;
  if (!tree[dir]) tree[dir] = {};
  bounds = calculateForZoomPlus1(bounds, quadBound[dir]);
  add(tree[dir], bounds, { mode: meta.mode, zoom: z - 1 }, value);
}

function calculateForZoomPlus1(aarect, bounds) {
  return [
    2 * (aarect[0] - bounds.x[0]),
    2 * (aarect[1] - bounds.y[0]),
    2 * (aarect[2] - bounds.x[0]),
    2 * (aarect[3] - bounds.y[0])
  ];
}

function hasArea(aabb, z) {
  const epsilon = 1e-4 * Math.pow(0.5, z);
  if (aabb[0] >= aabb[2] - epsilon) return false;
  if (aabb[1] >= aabb[3] - epsilon) return false;
  return true;
}

function add(tree, bounds, meta, value) {
  const epsilon = 1e-6;
  const z = meta.zoom;
  bounds = geometry.clipToBounds(bounds, quadBound.parent);
  if (!hasArea(bounds, z)) return;
  const stop =
    z === 0 ||
    (bounds[0] < epsilon &&
      bounds[1] < epsilon &&
      bounds[2] > 1 - epsilon &&
      bounds[3] > 1 - epsilon);
  if (stop) {
    const p = (bounds[3] - bounds[1]) * (bounds[2] - bounds[0]);
    tree.min = tree.min === undefined ? value : Math.min(value, tree.min);
    tree.max = tree.max === undefined ? value : Math.max(value, tree.max);

    if (meta.mode === "class") {
      // For class based maps:
      if (p > (tree.p || 0)) {
        // TODO: Can't do this because multiple pixels having same v
        tree.p = p;
        tree.v = value;
      }
    } else if (meta.mode === "coords") {
      tree.p = value;
    } else {
      // For linear gradient maps:
      tree.v = (tree.v || 0) + value * p;
      tree.p = (tree.p || 0) + p;
    }
    return;
  }

  addChild(tree, "nw", bounds, meta, value);
  addChild(tree, "ne", bounds, meta, value);
  addChild(tree, "sw", bounds, meta, value);
  addChild(tree, "se", bounds, meta, value);
}

module.exports = { add };
