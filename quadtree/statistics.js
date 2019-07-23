function dive(tree, acc, z) {
  if (!tree) return;
  acc[z] = acc[z] || { count: 0, area: 0 };
  if (tree.v) {
    acc[z].count++;
    acc[z].area += tree.p;
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
