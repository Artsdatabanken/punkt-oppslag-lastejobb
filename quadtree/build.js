const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};

function addChild(tree, dir, bounds, z, value) {
  bounds = clip(bounds, quadBound[dir]);
  if (!hasArea(bounds, z)) return;
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

function hasArea(aabb, z) {
  const epsilon = 1e-4 * Math.pow(0.5, z);
  if (aabb[0] >= aabb[2] - epsilon) return false;
  if (aabb[1] >= aabb[3] - epsilon) return false;
  return true;
}

function add(tree, bounds, z, value) {
  bounds = clip(bounds, quadBound.parent);
  if (!hasArea(bounds, z)) return;
  const stop =
    z === 0 ||
    (bounds[0] === 0 && bounds[1] === 0 && bounds[2] === 1 && bounds[3] === 1);
  if (stop) {
    const p = (bounds[3] - bounds[1]) * (bounds[2] - bounds[0]);
    tree.min = tree.min === undefined ? value : Math.min(value, tree.min);
    tree.max = tree.max === undefined ? value : Math.max(value, tree.max);
    if (tree.v === undefined) tree.v = value;
    else tree.v = (tree.v * tree.p) / (tree.p + p) + (value * p) / (tree.p + p);

    tree.p = (tree.p || 0) + p;
    return;
  }

  addChild(tree, "nw", bounds, z, value);
  addChild(tree, "ne", bounds, z, value);
  addChild(tree, "sw", bounds, z, value);
  addChild(tree, "se", bounds, z, value);
}

module.exports = { add };
