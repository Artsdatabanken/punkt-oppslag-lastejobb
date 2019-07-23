const quadtree = require("./index");

test("compact same value in all", () => {
  const tree = {
    nw: { p: 1, v: 1 },
    ne: { p: 1, v: 1 },
    sw: { p: 1, v: 1 },
    se: { p: 1, v: 1 }
  };
  const expected = '{"v":1,"p":1}';
  testCompact(tree, expected);
});

test("don't compact different value", () => {
  const tree = {
    nw: { p: 1, v: 1 },
    ne: { p: 1, v: 0.5 },
    sw: { p: 1, v: 1 },
    se: { p: 1, v: 1 }
  };
  const expected = JSON.stringify(tree);
  testCompact(tree, expected);
});

test("don't compact unless fully covered", () => {
  const tree = {
    nw: { p: 1, v: 1 },
    ne: { p: 1, v: 1 },
    sw: { p: 0.5, v: 1 },
    se: { p: 1, v: 1 }
  };
  const expected = JSON.stringify(tree);
  testCompact(tree, expected);
});

function testCompact(tree, expected) {
  quadtree.compact.equalChildren(tree);
  expect(JSON.stringify(tree)).toBe(expected);
}
