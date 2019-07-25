function addVariance(tree, path) {
  if (!tree) return;
  const subPath = [...path, tree];
  addVariance(tree.nw, subPath);
  addVariance(tree.ne, subPath);
  addVariance(tree.sw, subPath);
  addVariance(tree.se, subPath);

  if (!(tree.v >= 0)) {
    debugger;
    throw new Error();
  }
  subPath.forEach(node => {
    node.var = node.var || 0;
    node.n = (node.n || 0) + 1;
    node.var += Math.pow(tree.v - node.v, 2);
  });
}

function normalizeVariance(node) {
  if (!node) return;
  normalizeVariance(node.nw);
  normalizeVariance(node.ne);
  normalizeVariance(node.sw);
  normalizeVariance(node.se);

  node.var = node.n > 1 ? node.var / (node.n - 1) : 0;
  //  delete node.count;
}

function add(tree) {
  const path = [];
  addVariance(tree, path);
  normalizeVariance(tree);
}
module.exports = { add };
