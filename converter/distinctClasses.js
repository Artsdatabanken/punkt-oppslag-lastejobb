function encode(node, area, value) {
  if (area > (node.p || 0)) {
    // TODO: Can't do this because multiple pixels having same v
    node.p = area;
    node.v = value;
  }
}

module.exports = { encode };
