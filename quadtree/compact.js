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

  let avg = 0.25 * (tree.nw.v + tree.ne.v + tree.sw.v + tree.se.v);
  if (isNaN(avg)) return;
  const threshold = 0.01;
  if (Math.abs(tree.nw.v - avg) > threshold) return;
  if (Math.abs(tree.ne.v - avg) > threshold) return;
  if (Math.abs(tree.sw.v - avg) > threshold) return;
  if (Math.abs(tree.se.v - avg) > threshold) return;

  // All quads have the same value, remove and set the value on parent
  tree.v = tree.nw.v;
  tree.p = ~~(0.25 * (tree.nw.p + tree.ne.p + tree.sw.p + tree.se.p));
  if (!tree.p) debugger;
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
  if (tree.v) tree.v = ~~tree.v;
}

module.exports = { equalChildren, quantizeValues };
