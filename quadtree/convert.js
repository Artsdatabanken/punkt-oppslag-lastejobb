const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};

function add(tree, cursor, meta, value) {
  cursor.bounds = geometry.clipToBounds(cursor.bounds, quadBound.parent);
  if (cursor.zoom === cursor.maxzoom) return cursor.path;
  addChild(tree, "nw", cursor, meta, value);
  addChild(tree, "ne", cursor, meta, value);
  addChild(tree, "sw", cursor, meta, value);
  addChild(tree, "se", cursor, meta, value);
}

module.exports = { add };
