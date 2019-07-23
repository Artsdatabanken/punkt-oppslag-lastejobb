function dive(tree, acc, z) {
  if (!tree) return;
  acc[z] = acc[z] || { count: 0, area: 0, vmin: 1e9, vmax: -1e9 };
  if (tree.v) {
    const n = acc[z];
    n.count++;
    n.area += tree.p;
    n.vmin = Math.min(n.vmin, tree.v);
    n.vmax = Math.max(n.vmax, tree.v);
  }
  dive(tree.nw, acc, z + 1);
  dive(tree.ne, acc, z + 1);
  dive(tree.sw, acc, z + 1);
  dive(tree.se, acc, z + 1);
}

function summarize(tree) {
  const acc = {};
  dive(tree, acc, 0);
  return acc;
}

module.exports = { summarize };
