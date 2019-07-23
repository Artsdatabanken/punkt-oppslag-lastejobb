function getChildKey(x, y) {
  const ns = y < 0.5 ? "n" : "s";
  const we = x < 0.5 ? "w" : "e";
  return ns + we;
}

function getChild(tree, x, y) {
  const key = getChildKey(x, y);
  return tree[key];
}

function accumulateHits(acc, node, z) {
  if (!node.value) return;
  acc[z] = acc[z] || { area: 0, value: 0 };
  const s = acc[z];
  s.value = (s.value ? s.value / s.area : 0) + node.value / node.area;
  s.area += node.area;
  s.area *= s.area;
}

function innerFind(tree, x, y, z, currentZ, acc) {
  if (z === currentZ) return accumulateHits(acc, tree, currentZ);
  const leaf = getChild(tree, x, y);
  if (leaf) innerFind(leaf, 2 * (x % 0.5), 2 * (y % 0.5), z, currentZ + 1, acc);
  return accumulateHits(acc, tree, currentZ);
}

function find(tree, x, y, z, currentZ = 0) {
  const acc = { x, y, z };
  innerFind(tree, x, y, z, 0, acc);
  return acc;
}

const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};

function createChild(tree, dir, bounds, z, value) {
  bounds = clip(bounds, quadBound[dir]);
  if (!hasArea(bounds)) return;
  if (!tree[dir]) tree[dir] = {};
  bounds = normalizeToNextZoom(bounds, quadBound[dir]);
  create(tree[dir], bounds, z - 1, value);
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

function create(tree, bounds, z, value) {
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

  createChild(tree, "nw", bounds, z, value);
  createChild(tree, "ne", bounds, z, value);
  createChild(tree, "sw", bounds, z, value);
  createChild(tree, "se", bounds, z, value);
}

function add(tree, bounds, z, value) {
  create(tree, bounds, z, value);
}

module.exports = { add, find };
