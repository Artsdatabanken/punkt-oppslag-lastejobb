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
      acc.count++;
      acc.min = Math.min(acc.min, e.v);
      if (e.min) acc.min = Math.min(acc.min, e.min);
      if (e.max) acc.max = Math.max(acc.max, e.max);
      acc.max = Math.max(acc.max, e.v);
      return acc;
    },
    { sum: 0, count: 0, min: 1e9, max: -1e9, p: 0 }
  );
  if (!tree.v) tree.v = ~~(acc.sum / acc.count);
  tree.min = acc.min;
  tree.max = acc.max;
}

module.exports = {
  build
};
