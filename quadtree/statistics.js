function dive(tree, acc, z) {
  if (!tree) return;
  acc[z] = acc[z] || { count: 0, area: 0, min: 1e9, max: -1e9 };
  if (tree.v) {
    const n = acc[z];
    n.count++;
    n.area += Math.pow(0.5, z) * tree.p;
    n.min = Math.min(n.min, tree.v);
    n.max = Math.max(n.max, tree.v);
  }
  dive(tree.nw, acc, z + 1);
  dive(tree.ne, acc, z + 1);
  dive(tree.sw, acc, z + 1);
  dive(tree.se, acc, z + 1);
}

function summarize(tree) {
  const acc = {};
  dive(tree, acc, 0);
  for (var z = 0; z < acc.length; z++) {
    //    acc[z]
  }
  return acc;
}

module.exports = { summarize };
