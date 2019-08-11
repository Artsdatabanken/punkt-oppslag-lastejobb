const quadtree = require("./index");
const gradient = require("../converter/gradient");

test("zoom 0 quarter", () => {
  const expected = { v: 1, p: 0.25 };
  const input = [0.0, 0.0, 0.5, 0.5];
  buildqt([input], 0, expected);
});

test("zoom 0 quarter offset", () => {
  const expected = { v: 1, p: 0.25 };

  const input = [0.1, 0.1, 0.6, 0.6];
  buildqt([input], 0, expected);
});

test("zoom 1 quarter", () => {
  const expected = { nw: { v: 1, p: 1 } };

  const input = [0.0, 0.0, 0.5, 0.5];
  buildqt([input], 1, expected);
});

test("zoom 1 double quarter", () => {
  const expected = { nw: { v: 1, p: 1.04 } };

  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 1, expected);
});

test("zoom 2 double quarter", () => {
  const expected = {
    nw: {
      nw: { v: 1, p: 1 },
      ne: { v: 1, p: 1 },
      sw: { v: 1, p: 1 },
      se: { v: 1, p: 1.16 }
    }
  };
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 2, expected);
});

test("zoom 3 double quarter", () => {
  const expected = {
    nw: { nw: { v: 1, p: 0.8000000000000002 } }
  };

  const input = [[0.0, 0.0, 0.1, 0.1], [0.0, 0.0, 0.2, 0.2]];
  buildqt(input, 2, expected);
});

test("zoom 3 small x 2", () => {
  const expected = {
    nw: {
      nw: { nw: { v: 1, p: 0.0032 } },
      se: { ne: { v: 1, p: 0.00006400000000000012 } }
    }
  };

  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 3, expected);
});

test("zoom 4 small x 2", () => {
  const expected = {
    nw: {
      nw: { nw: { nw: { v: 1, p: 0.0128 } } },
      se: { ne: { nw: { v: 1, p: 0.0002560000000000005 } } }
    }
  };

  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 4, expected);
});

test("zoom 2 covers much", () => {
  const expected = {
    se: { se: { v: 1, p: 1 } }
  };
  const input = [[0.75, 0.75, 1, 1]];
  buildqt(input, 2, expected);
});

test("zoom 1 quarter offset", () => {
  const expected = {
    nw: { v: 1, p: 0.36 },
    sw: { v: 1, p: 0.11999999999999997 }
  };

  const input = [0.2, 0.2, 0.5, 0.6];
  buildqt([input], 1, expected);
});

function buildqt(items, zoom, expected) {
  const layer = { zoom: zoom, converter: gradient };
  const tree = {};
  items.forEach(item => {
    const cursor = { bounds: item, zoom: 0, targetZoom: layer.zoom };
    quadtree.add(tree, cursor, layer, 1);
  });
  expect(tree).toStrictEqual(expected);
}
