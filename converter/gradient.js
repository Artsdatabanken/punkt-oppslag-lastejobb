function encode(node, area, value) {
  node.v = (node.v || 0) + value * area;
  node.p = (node.p || 0) + area;
}

module.exports = { encode };
