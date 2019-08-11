function canPullFromChild(child, value) {
  if (!child.v) return false;
  if (!child.p) return false;
  if (value && value != child.v) return false;
  return true;
}

function pruneChildren(tree, options = { compactAnyP: false }) {
  let count = 0;
  if (!tree) return count;
  count += pruneChildren(tree.nw);
  count += pruneChildren(tree.ne);
  count += pruneChildren(tree.sw);
  count += pruneChildren(tree.se);

  if (!tree.nw) return count;
  if (!tree.ne) return count;
  if (!tree.sw) return count;
  if (!tree.se) return count;

  if (!options.compactAnyP) {
    if (tree.nw.p !== 1) return count;
    if (tree.ne.p !== 1) return count;
    if (tree.sw.p !== 1) return count;
    if (tree.se.p !== 1) return count;
  }

  let value = 0;
  if (!canPullFromChild(tree.nw, value)) return count;
  value = tree.nw.v;
  if (!canPullFromChild(tree.ne, value)) return count;
  value = tree.ne.v;
  if (!canPullFromChild(tree.sw, value)) return count;
  value = tree.sw.v;
  if (!canPullFromChild(tree.se, value)) return count;
  value = tree.se.v;

  // All quads have the same value, remove and set the value on parent
  tree.v = value;
  tree.p = 0.25 * (tree.nw.p + tree.ne.p + tree.sw.p + tree.se.p);
  tree.min = Math.min(tree.nw.min, tree.ne.min, tree.sw.min, tree.se.min);
  tree.max = Math.max(tree.nw.max, tree.ne.max, tree.sw.max, tree.se.max);
  delete tree.nw;
  delete tree.ne;
  delete tree.sw;
  delete tree.se;
  return count + 4;
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
