const quadtree = require("./index");

test("pyramid", () => {
  const tree = {
    ne: {
      sw: {
        nw: { p: 1, v: 41, max: 81, min: 1 },
        se: { p: 1, v: 9, max: 16, min: 4 }
      }
    },
    sw: { p: 1, v: 44, max: 90, min: 33 }
  };

  const expected = {
    ne: {
      sw: {
        nw: { p: 1, v: 41, max: 81, min: 1 },
        se: { p: 1, v: 9, max: 16, min: 4 },
        min: 1,
        max: 81,
        v: 25
      },
      min: 1,
      max: 81,
      v: 25
    },
    sw: { p: 1, v: 44, max: 90, min: 33 },
    min: 1,
    max: 90,
    v: 34
  };

  testCompact(tree, expected);
});

function testCompact(tree, expected) {
  quadtree.addPyramid(tree);
  expect(tree).toStrictEqual(expected);
}
