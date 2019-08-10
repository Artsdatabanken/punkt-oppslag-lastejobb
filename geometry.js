function clipToBounds(aarect, clippingBounds) {
  return [
    Math.min(clippingBounds.x[1], Math.max(clippingBounds.x[0], aarect[0])),
    Math.min(clippingBounds.y[1], Math.max(clippingBounds.y[0], aarect[1])),
    Math.min(clippingBounds.x[1], Math.max(clippingBounds.x[0], aarect[2])),
    Math.min(clippingBounds.y[1], Math.max(clippingBounds.y[0], aarect[3]))
  ];
}

/*
Normalizes coordinates to 0-1 range
*/
function normalize(coord, worldBounds) {
  return [
    (coord[0] - worldBounds.left) / worldBounds.width,
    (coord[1] - worldBounds.bottom) / worldBounds.height,
    (coord[2] - worldBounds.left) / worldBounds.width,
    (coord[3] - worldBounds.bottom) / worldBounds.height
  ];
}

module.exports = { clipToBounds, normalize };
