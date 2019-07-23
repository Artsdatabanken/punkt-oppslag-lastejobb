const quadtree = require("./index");

test("zoom 0 quarter", () => {
  const tree = { area: 0.25, value: 0.25 };
  const expected = '{"0":{"area":0.0625,"value":1},"x":0.2,"y":0.2,"z":42}';
  query(tree, 0.2, 0.2, expected);
});

test("zoom 1 quarter", () => {
  const tree = { nw: { area: 1, value: 1 } };
  const expected = '{"1":{"area":1,"value":1},"x":0.2,"y":0.2,"z":42}';
  query(tree, 0.2, 0.2, expected);
});

test("zoom 3 double quarter", () => {
  const tree = {
    nw: {
      area: 1,
      value: 1,
      se: { se: { area: 0.6399999999999997, value: 0.6399999999999997 } }
    }
  };
  const expected =
    '{"1":{"area":1,"value":1},"3":{"area":0.4095999999999996,"value":1},"x":0.4,"y":0.4,"z":42}';

  query(tree, 0.4, 0.4, expected);
});

function query(tree, x, y, expected) {
  const actual = quadtree.find(tree, x, y, 42);
  expect(JSON.stringify(actual)).toBe(expected);
}
