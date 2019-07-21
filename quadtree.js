function getChildKey(x, y) {
  const ns = y < 0.5 ? "n" : "s";
  const we = x < 0.5 ? "w" : "e";
  return ns + we;
}

function createChild(tree, x, y) {
  const key = getChildKey(x, y);
  if (!tree[key]) tree[key] = {};
  return tree[key];
}

function getChild(tree, x, y) {
  const key = getChildKey(x, y);
  return tree[key];
}

let max = 0;

function find2(quad, x, y, z) {
  const best = { distSquared: 9e19 };
  find2_(quad, best, x, y, z);
  best.dist = Math.sqrt(best.distSquared) * Math.pow(0.5, z);
  delete best.distSquared;
  return best;
}

function distanceFromQuadSquared(px, py) {
  const x = 0.5;
  const y = 0.5;
  const width = 1;
  const height = 1;
  dx = Math.max(Math.abs(px - x) - width / 2, 0);
  dy = Math.max(Math.abs(py - y) - height / 2, 0);
  return dx * dx + dy * dy;
}

function addCandidate(prio, tile, x, y, dx, dy) {
  if (!tile) return;
  prio.push({
    t: tile,
    x: x - dx,
    y: y - dy,
    d: 0
  });
}

function getCandidates(quad, x, y) {
  const prio = [];
  addCandidate(prio, quad.nw, x, y, 0, 0);
  addCandidate(prio, quad.ne, x, y, 0.5, 0);
  addCandidate(prio, quad.sw, x, y, 0, 0.5);
  addCandidate(prio, quad.se, x, y, 0.5, 0.5);
  for (let i = 0; i < prio.length; i++)
    prio[i].d = distanceFromQuadSquared(prio[i].x, prio[i].y);
  prio.sort((a, b) => (a.d > b.d ? 1 : -1));
  return prio;
}

function find2_(quad, best, x, y, z) {
  if (distanceFromQuadSquared(x, y) > Math.pow(0.5, z) * best.distSquared)
    return;
  if (z > 0) {
    const prio = getCandidates(quad, x, y);
    for (let i = 0; i < prio.length; i++) {
      const tile = prio[i];
      find2_(tile.t, best, 2 * tile.x, 2 * tile.y, z - 1);
    }
    return;
  }
  if (!quad.value) return;
  const distSquared = (x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5);
  //  console.log(quad.value + ": " + Math.sqrt(distSquared));
  if (distSquared < best.distSquared) {
    best.distSquared = distSquared;
    best.value = quad.value;
  }
}

function find(tree, x, y, z) {
  if (z === 0) return { [z]: tree.value };
  const leaf = getChild(tree, x, y);
  if (!leaf) return { [z]: tree.value };
  const dv = find(leaf, 2 * (x % 0.5), 2 * (y % 0.5), z - 1);
  return Object.assign({}, dv, { [z]: tree.value });
}

const quadBound = {
  parent: { x: [0, 1], y: [0, 1] },
  nw: { x: [0, 0.5], y: [0, 0.5] },
  ne: { x: [0.5, 1], y: [0, 0.5] },
  sw: { x: [0, 0.5], y: [0.5, 1] },
  se: { x: [0.5, 1], y: [0.5, 1] }
};
function createChild(tree, dir, bounds, z, value) {
  const cb = quadBound[dir];
  bounds = clip(bounds, cb);
  debugger;
  if (bounds[0] >= bounds[2]) return;
  if (bounds[1] >= bounds[3]) return;
  debugger;
  return create(tree, bounds, z - 1, value);
}

function clip(aarect, bounds) {
  return [
    Math.max(bounds.x[0], aarect[0]),
    Math.min(bounds.x[1], aarect[1]),
    Math.max(bounds.y[0], aarect[2]),
    Math.min(bounds.y[1], aarect[3])
  ];
}

function create(tree, bounds, z, value) {
  if (z === 0) return tree;

  createChild(tree, "nw", bounds, z, value);
  createChild(tree, "ne", bounds, z, value);
  createChild(tree, "sw", bounds, z, value);
  createChild(tree, "se", bounds, z, value);
}

function add(tree, bounds, z, value) {
  tree = create(tree, bounds, z, value);
  bounds = clip(bounds, quadBound.parent);
  const area = (bounds[3] - bounds[1]) * (bounds[2] - bounds[0]);
  tree.area = (tree.area || 0) + area;
  if (value < -5) debugger;
  if (area > 1e-6) debugger;
  tree.value = (tree.value || 0) + value * area;
}

module.exports = { add, find, find2 };
