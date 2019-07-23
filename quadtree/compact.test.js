const quadtree = require("./index");

test("compact same value in all", () => {
  const tree = {
    nw: { area: 1, value: 1 },
    ne: { area: 1, value: 1 },
    sw: { area: 1, value: 1 },
    se: { area: 1, value: 1 }
  };
  const expected = '{"value":1,"area":1}';
  testCompact(tree, expected);
});

test("don't compact different value", () => {
  const tree = {
    nw: { area: 1, value: 1 },
    ne: { area: 1, value: 0.5 },
    sw: { area: 1, value: 1 },
    se: { area: 1, value: 1 }
  };
  const expected = JSON.stringify(tree);
  testCompact(tree, expected);
});

test("don't compact unless fully covered", () => {
  const tree = {
    nw: { area: 1, value: 1 },
    ne: { area: 1, value: 1 },
    sw: { area: 0.5, value: 1 },
    se: { area: 1, value: 1 }
  };
  const expected = JSON.stringify(tree);
  testCompact(tree, expected);
});

function testCompact(tree, expected) {
  quadtree.compact.equalChildren(tree);
  expect(JSON.stringify(tree)).toBe(expected);
}
