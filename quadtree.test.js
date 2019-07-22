const sum = require("./quadtree");

test("zoom 0 quarter", () => {
  const tree = {};
  sum.add(tree, [0, 0, 0.5, 0.5], 0, 1);
  expect(JSON.stringify(tree)).toBe('{"area":0.25,"value":0.25}');
});

test("zoom 0 quarter offset", () => {
  const tree = {};
  sum.add(tree, [0.1, 0.1, 0.6, 0.6], 0, 1);
  expect(JSON.stringify(tree)).toBe('{"area":0.25,"value":0.25}');
});

test("zoom 1 quarter", () => {
  const tree = {};
  sum.add(tree, [0.0, 0.0, 0.5, 0.5], 1, 1);
  expect(JSON.stringify(tree)).toBe('{"nw":{"area":1,"value":1}}');
});

test("zoom 1 quarter offset", () => {
  const tree = {};
  sum.add(tree, [0.1, 0.1, 0.6, 0.6], 1, 1);
  expect(JSON.stringify(tree)).toBe(
    '{"nw":{"area":0.64,"value":0.64},"ne":{"area":0.15999999999999998,"value":0.15999999999999998},"sw":{"area":0.15999999999999998,"value":0.15999999999999998},"se":{"area":0.03999999999999998,"value":0.03999999999999998}}'
  );
});
