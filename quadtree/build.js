const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};

function addChild(tree, dir, bounds, z, value) {
  bounds = clip(bounds, quadBound[dir]);
  if (!hasArea(bounds)) return;
  if (!tree[dir]) tree[dir] = {};
  bounds = normalizeToNextZoom(bounds, quadBound[dir]);
  add(tree[dir], bounds, z - 1, value);
}

function normalizeToNextZoom(aarect, bounds) {
  return [
    2 * (aarect[0] - bounds.x[0]),
    2 * (aarect[1] - bounds.y[0]),
    2 * (aarect[2] - bounds.x[0]),
    2 * (aarect[3] - bounds.y[0])
  ];
}

function clip(aarect, bounds) {
  return [
    Math.min(bounds.x[1], Math.max(bounds.x[0], aarect[0])),
    Math.min(bounds.y[1], Math.max(bounds.y[0], aarect[1])),
    Math.min(bounds.x[1], Math.max(bounds.x[0], aarect[2])),
    Math.min(bounds.y[1], Math.max(bounds.y[0], aarect[3]))
  ];
}

function hasArea(aabb) {
  if (aabb[0] >= aabb[2]) return false;
  if (aabb[1] >= aabb[3]) return false;
  return true;
}

function add(tree, bounds, z, value) {
  bounds = clip(bounds, quadBound.parent);
  if (!hasArea(bounds)) return;
  const stop =
    z === 0 ||
    (bounds[0] === 0 && bounds[1] === 0 && bounds[2] === 1 && bounds[3] === 1);
  if (stop) {
    const area = (bounds[3] - bounds[1]) * (bounds[2] - bounds[0]);
    tree.area = (tree.area || 0) + area;
    tree.value = (tree.value || 0) + value * area;
    return;
  }

  addChild(tree, "nw", bounds, z, value);
  addChild(tree, "ne", bounds, z, value);
  addChild(tree, "sw", bounds, z, value);
  addChild(tree, "se", bounds, z, value);
}

module.exports = { add };
