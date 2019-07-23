const quadtree = require("./index");

test("zoom 0 quarter", () => {
  const tree = { p: 0.25, v: 0.25 };
  const expected =
    '{"0":{"v":0.25,"min":0.25,"max":0.25},"x":0.2,"y":0.2,"z":42}';

  query(tree, 0.2, 0.2, expected);
});

test("zoom 1 quarter", () => {
  const tree = { nw: { p: 1, v: 1 } };
  const expected = '{"1":{"v":1,"min":1,"max":1},"x":0.2,"y":0.2,"z":42}';

  query(tree, 0.2, 0.2, expected);
});

test("zoom 3 double quarter", () => {
  const tree = {
    nw: {
      p: 1,
      v: 1,
      se: { se: { p: 0.6399999999999997, v: 0.6399999999999997 } }
    }
  };
  const expected =
    '{"1":{"v":1,"min":1,"max":1},"3":{"v":0.6399999999999997,"min":0.6399999999999997,"max":0.6399999999999997},"x":0.4,"y":0.4,"z":42}';

  query(tree, 0.4, 0.4, expected);
});

function query(tree, x, y, expected) {
  const actual = quadtree.find(tree, x, y, 42);
  expect(JSON.stringify(actual)).toBe(expected);
}
