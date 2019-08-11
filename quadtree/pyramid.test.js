const quadtree = require("./index");

test("pyramid", () => {
  const tree = {
    max: 90,
    min: 1,
    ne: {
      max: 81,
      min: 1,
      sw: {
        max: 81,
        min: 1,
        v: 25
      },
      v: 25
    },
    v: 34
  };

  const expected = {
    ne: {
      sw: {
        min: 1,
        max: 81,
        v: 25
      },
      min: 1,
      max: 81,
      p: 0,
      v: 25
    },
    min: 1,
    max: 90,
    p: 0,
    v: 34
  };

  testCompact(tree, expected);
});

function testCompact(tree, expected) {
  quadtree.addPyramid(tree, {});
  expect(tree).toStrictEqual(expected);
}
