const variance = require("./variance");

function dive(tree, acc, z) {
  if (!tree) return;
  acc.zoom[z] = acc.zoom[z] || { count: 0, area: 0, min: 1e9, max: -1e9 };
  if (tree.v !== undefined) {
    const n = acc.zoom[z];
    n.count++;
    n.area += tree.p;
    n.min = Math.min(n.min, tree.v);
    n.max = Math.max(n.max, tree.v);
    //    acc.histogram[tree.v] = (acc.histogram[tree.v] || 0) + 1;
  }
  dive(tree.nw, acc, z + 1);
  dive(tree.ne, acc, z + 1);
  dive(tree.sw, acc, z + 1);
  dive(tree.se, acc, z + 1);
}

function summarize(tree) {
  const acc = { histogram: Array(256).fill(0), zoom: {} };
  dive(tree, acc, 0);
  for (var z in Object.keys(acc.zoom)) {
    const zoom = acc.zoom[z];
    zoom.tilekm2 =
      (zoom.count *
        Math.pow(0.5, z) *
        tree.bounds.width *
        Math.pow(0.5, z) *
        tree.bounds.height) /
      1000 /
      1000;
    zoom.coverkm2 =
      (zoom.area *
        Math.pow(0.5, z) *
        tree.bounds.width *
        Math.pow(0.5, z) *
        tree.bounds.height) /
      1000 /
      1000;
    zoom.cover = zoom.count / Math.pow(2, z) / Math.pow(2, z);
  }
  return acc;
}

module.exports = { summarize, variance };
