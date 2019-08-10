const geometry = require("../geometry");

const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};

function addChild(tree, dir, parentCursor, meta, value) {
  let bounds = geometry.clipToBounds(parentCursor.bounds, quadBound[dir]);
  const area = calcArea(parentCursor.bounds);
  if (area <= 0) return;
  const xbounds = quadBound[dir];
  bounds = [
    2 * (bounds[0] - xbounds.x[0]),
    2 * (bounds[1] - xbounds.y[0]),
    2 * (bounds[2] - xbounds.x[0]),
    2 * (bounds[3] - xbounds.y[0])
  ];
  const cursor = {
    bounds: bounds,
    area,
    zoom: parentCursor.zoom + 1,
    targetZoom: parentCursor.targetZoom
  };
  if (!tree[dir]) tree[dir] = {};

  add(tree[dir], cursor, meta, value);
}

function calcArea(aabb) {
  let area = (aabb[2] - aabb[0]) * (aabb[3] - aabb[1]);
  //  if (area < epsilon) area = 0;
  return area;
}

function add(tree, cursor, meta, value) {
  const epsilon = 1e-6;
  cursor.bounds = geometry.clipToBounds(cursor.bounds, quadBound.parent);
  const area = calcArea(cursor.bounds);
  if (area <= 0) return;
  const stop = cursor.zoom === cursor.targetZoom;
  if (stop) {
    if (meta.addMinMax) {
      tree.min = tree.min === undefined ? value : Math.min(value, tree.min);
      tree.max = tree.max === undefined ? value : Math.max(value, tree.max);
    }
    if (meta.mode === "class") {
      // For class based maps:
      if (area > (tree.p || 0)) {
        // TODO: Can't do this because multiple pixels having same v
        tree.p = area;
        tree.v = value;
      }
    } else if (meta.mode === "coords") {
      tree.p = value;
    } else {
      // For linear gradient maps:
      tree.v = (tree.v || 0) + value * area;
      tree.p = (tree.p || 0) + area;
    }
    meta.quadCount = (cursor.quadCount || 0) + 1;
    return;
  }

  addChild(tree, "nw", cursor, meta, value);
  addChild(tree, "ne", cursor, meta, value);
  addChild(tree, "sw", cursor, meta, value);
  addChild(tree, "se", cursor, meta, value);
}

module.exports = { add };
