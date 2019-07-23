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

function find(tree, x, y, z) {
  const acc = { x, y, z };
  innerFind(tree, x, y, z, 0, acc);
  return acc;
}

module.exports = { find };
