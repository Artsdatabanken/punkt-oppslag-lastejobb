function equalChildren(tree) {
  if (!tree) return;
  equalChildren(tree.nw);
  equalChildren(tree.ne);
  equalChildren(tree.sw);
  equalChildren(tree.se);

  if (!tree.nw) return;
  if (!tree.ne) return;
  if (!tree.sw) return;
  if (!tree.se) return;

  if (tree.nw.p !== 1) return;
  if (tree.ne.p !== 1) return;
  if (tree.sw.p !== 1) return;
  if (tree.se.p !== 1) return;

  if (tree.nw.v !== tree.ne.v) return;
  if (tree.ne.v !== tree.sw.v) return;
  if (tree.sw.v !== tree.se.v) return;

  // All quads have the same value, remove and set the value on parent
  tree.v = tree.nw.v;
  tree.p = 0.25 * (tree.nw.p + tree.ne.p + tree.sw.p + tree.se.p);
  delete tree.nw;
  delete tree.ne;
  delete tree.sw;
  delete tree.se;
}

module.exports = { equalChildren };
