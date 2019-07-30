function build(tree, config) {
  if (!tree) return;
  build(tree.nw, config);
  build(tree.ne, config);
  build(tree.sw, config);
  build(tree.se, config);

  const items = [];
  if (tree.nw) items.push(tree.nw);
  if (tree.ne) items.push(tree.ne);
  if (tree.sw) items.push(tree.sw);
  if (tree.se) items.push(tree.se);
  if (items.length <= 0) return;
  const acc = items.reduce(
    (acc, e) => {
      if (config.mode === "class") {
        if (e.p > tree.p) {
          tree.p = e.p;
          tree.v = e.v;
        }
      } else {
        acc.sum += e.v;
        acc.p += e.p;
        tree.min = tree.min === undefined ? e.min : Math.min(tree.min, e.min);
        tree.max = tree.max === undefined ? e.max : Math.max(tree.max, e.max);
      }
      return acc;
    },
    { sum: 0, p: 0 }
  );
  if (!tree.v) {
    tree.v = ~~(0.25 * acc.sum);
  }
  tree.p = (tree.p || 0) + 0.25 * acc.p;
}

module.exports = {
  build
};
