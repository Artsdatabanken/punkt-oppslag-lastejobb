function canPullFromChild(child, value) {
  if (!child.v) return false;
  if (!child.p) return false;
  if (value && value != child.v) return false;
  return true;
}

function pruneChildren(node, options = { compactAnyP: false }) {
  let count = 0;
  if (!node) return count;
  count += pruneChildren(node.nw);
  count += pruneChildren(node.ne);
  count += pruneChildren(node.sw);
  count += pruneChildren(node.se);

  if (!node.nw) return count;
  if (!node.ne) return count;
  if (!node.sw) return count;
  if (!node.se) return count;

  const epsilon = 1e-4;
  if (!options.compactAnyP) {
    if (node.nw.p < 1 - epsilon) return count;
    if (node.ne.p < 1 - epsilon) return count;
    if (node.sw.p < 1 - epsilon) return count;
    if (node.se.p < 1 - epsilon) return count;
  }

  let value = 0;
  if (!canPullFromChild(node.nw, value)) return count;
  value = node.nw.v;
  if (!canPullFromChild(node.ne, value)) return count;
  value = node.ne.v;
  if (!canPullFromChild(node.sw, value)) return count;
  value = node.sw.v;
  if (!canPullFromChild(node.se, value)) return count;
  value = node.se.v;

  // All quads have the same value, remove and set the value on parent
  node.v = value;
  node.p = 0.25 * (node.nw.p + node.ne.p + node.sw.p + node.se.p);
  if (node.nw.min) {
    node.min = Math.min(node.nw.min, node.ne.min, node.sw.min, node.se.min);
    node.max = Math.max(node.nw.max, node.ne.max, node.sw.max, node.se.max);
  }
  delete node.nw;
  delete node.ne;
  delete node.sw;
  delete node.se;
  return count + 4 - 1; // One parent tile added, 4 children removed
}

function quantizeValues(tree) {
  if (!tree) return;
  quantizeValues(tree.nw);
  quantizeValues(tree.ne);
  quantizeValues(tree.sw);
  quantizeValues(tree.se);
  tree.v = ~~tree.v;
  tree.min = ~~tree.min;
  tree.max = ~~tree.max;
}

module.exports = { pruneChildren, quantizeValues };
