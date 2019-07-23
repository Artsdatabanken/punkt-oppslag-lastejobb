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

  if (tree.nw.area !== 1) return;
  if (tree.ne.area !== 1) return;
  if (tree.sw.area !== 1) return;
  if (tree.se.area !== 1) return;

  if (tree.nw.value !== tree.ne.value) return;
  if (tree.ne.value !== tree.sw.value) return;
  if (tree.sw.value !== tree.se.value) return;

  // All quads have the same value, remove and set the value on parent
  tree.value = tree.nw.value;
  tree.area =
    0.25 * (tree.nw.area + tree.ne.area + tree.sw.area + tree.se.area);
  delete tree.nw;
  delete tree.ne;
  delete tree.sw;
  delete tree.se;
}

module.exports = { equalChildren };
