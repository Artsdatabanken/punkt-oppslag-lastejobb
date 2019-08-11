const { log } = require("lastejobb");
const geometry = require("../geometry");

const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};

function addChild(tree, quadrant, parentCursor, layer, value) {
  const xbounds = quadBound[quadrant];
  let bounds = geometry.clipToBounds(parentCursor.bounds, xbounds);
  bounds = [
    2 * (bounds[0] - xbounds.x[0]),
    2 * (bounds[1] - xbounds.y[0]),
    2 * (bounds[2] - xbounds.x[0]),
    2 * (bounds[3] - xbounds.y[0])
  ];
  const area = calcArea(bounds);
  if (area <= 0) return;
  const cursor = {
    bounds,
    area,
    zoom: parentCursor.zoom + 1,
    targetZoom: parentCursor.targetZoom
  };
  if (!tree[quadrant]) tree[quadrant] = {};

  add(tree[quadrant], cursor, layer, value);
}

// Area of axis aligned bounding box
function calcArea(aabb) {
  return (aabb[2] - aabb[0]) * (aabb[3] - aabb[1]);
}

function add(tree, cursor, layer, value) {
  const epsilon = 1e-6;
  const bounds = geometry.clipToBounds(cursor.bounds, quadBound.parent);
  const area = calcArea(bounds);
  if (area <= 0) return;
  if (cursor.zoom === cursor.targetZoom) {
    layer.converter.encode(tree, area, value);
    if (layer.addMinMax) {
      tree.min = tree.min === undefined ? value : Math.min(value, tree.min);
      tree.max = tree.max === undefined ? value : Math.max(value, tree.max);
    }
    layer.quadCount = (layer.quadCount || 0) + 1;
    return;
  }

  addChild(tree, "nw", cursor, layer, value);
  addChild(tree, "ne", cursor, layer, value);
  addChild(tree, "sw", cursor, layer, value);
  addChild(tree, "se", cursor, layer, value);
}

module.exports = { add };
