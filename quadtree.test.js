const sum = require("./quadtree");

test("adds 1 + 2 to equal 3", () => {
  const tree = {};
  sum.add(tree, [0, 0, 0.5, 0.5], 1, 1);
  expect(JSON.stringify(tree)).toBe('{"area":4,"value":1}');
});
