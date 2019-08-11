function encode(node, area, value) {
  if (area > (node.p || 0)) {
    // TODO: Can't do this because multiple pixels having same v
    node.p = area;
    node.v = value;
  }
}

function serialize(node) {
  return node.v;
}

module.exports = { encode, serialize };
