function build(tree) {
  if (!tree) return;
  build(tree.nw);
  build(tree.ne);
  build(tree.sw);
  build(tree.se);

  const items = [];
  if (tree.nw) items.push(tree.nw);
  if (tree.ne) items.push(tree.ne);
  if (tree.sw) items.push(tree.sw);
  if (tree.se) items.push(tree.se);
  if (items.length <= 0) return;
  const acc = items.reduce(
    (acc, e) => {
      acc.sum += e.v;
      acc.p += e.p;
      tree.min = tree.min === undefined ? e.min : Math.min(tree.min, e.min);
      tree.max = tree.max === undefined ? e.max : Math.max(tree.max, e.max);
      return acc;
    },
    { sum: 0, p: 0 }
  );
  if (!tree.v) {
    tree.v = ~~(acc.sum / items.length);
  }
  tree.p = (tree.p || 0) + 0.25 * acc.p;
}

module.exports = {
  build
};
