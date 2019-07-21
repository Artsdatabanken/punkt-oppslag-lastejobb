function normalize(coord, bounds) {
  return [
    (coord[0] - bounds.left) / bounds.width,
    (coord[1] - bounds.bottom) / bounds.height
  ];
}

function getExtents(data) {
  let bounds = {
    left: 9e9,
    bottom: 9e9,
    right: -9e9,
    top: -9e9
  };
  data.forEach(d => {
    bounds.left = Math.min(bounds.left, d.coord[1]);
    bounds.right = Math.max(bounds.right, d.coord[1]);
    bounds.bottom = Math.min(bounds.bottom, d.coord[0]);
    bounds.top = Math.max(bounds.top, d.coord[0]);
  });
  bounds.left = -5;
  bounds.right = 35;
  bounds.bottom = 50;
  bounds.top = 80;
  bounds.width = bounds.right - bounds.left;
  bounds.height = bounds.top - bounds.bottom;
  return bounds;
}

module.exports = { getExtents, normalize };
