function pullFromChild(child, value) {
  if (!child.v) return false;
  if (!child.p) return false;
  if (value && value != child.v) return false;
  return true;
}

function equalChildren(tree, options = { compactAnyP: true }) {
  if (!tree) return;
  equalChildren(tree.nw);
  equalChildren(tree.ne);
  equalChildren(tree.sw);
  equalChildren(tree.se);

  if (!tree.nw) return;
  if (!tree.ne) return;
  if (!tree.sw) return;
  if (!tree.se) return;

  if (!options.compactAnyP) {
    if (tree.nw.p !== 1) return;
    if (tree.ne.p !== 1) return;
    if (tree.sw.p !== 1) return;
    if (tree.se.p !== 1) return;
  }

  let value = 0;
  if (!pullFromChild(tree.nw, value)) return false;
  value = tree.nw.v;
  if (!pullFromChild(tree.ne, value)) return false;
  value = tree.ne.v;
  if (!pullFromChild(tree.sw, value)) return false;
  value = tree.sw.v;
  if (!pullFromChild(tree.se, value)) return false;
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

function removeP(tree) {
  if (!tree) return;
  removeP(tree.nw);
  removeP(tree.ne);
  removeP(tree.sw);
  removeP(tree.se);
  delete tree.p;
}

module.exports = { equalChildren, quantizeValues, removeP };
