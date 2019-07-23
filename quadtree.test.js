const quadtree = require("./quadtree");

test("zoom 0 quarter", () => {
  const expected = '{"area":0.25,"value":0.25}';
  const input = [0.0, 0.0, 0.5, 0.5];
  debugger;
  buildqt([input], 0, expected);
});

test("zoom 0 quarter offset", () => {
  const expected = '{"area":0.25,"value":0.25}';
  const input = [0.1, 0.1, 0.6, 0.6];
  buildqt([input], 0, expected);
});

test("zoom 1 quarter", () => {
  const expected = '{"nw":{"area":1,"value":1}}';
  const input = [0.0, 0.0, 0.5, 0.5];
  buildqt([input], 1, expected);
});

test("zoom 1 double quarter", () => {
  const expected = '{"nw":{"area":1.04,"value":1.04}}';
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 1, expected);
});

test("zoom 2 double quarter", () => {
  const expected =
    '{"nw":{"nw":{"area":1,"value":1},"ne":{"area":1,"value":1},"sw":{"area":1,"value":1},"se":{"area":1.16,"value":1.16}}}';
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 2, expected);
});

test("zoom 3 double quarter", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"area":1,"value":1},"ne":{"area":1,"value":1},"sw":{"area":1,"value":1},"se":{"area":1,"value":1}},"ne":{"nw":{"area":1,"value":1},"ne":{"area":1,"value":1},"sw":{"area":1,"value":1},"se":{"area":1,"value":1}},"sw":{"nw":{"area":1,"value":1},"ne":{"area":1,"value":1},"sw":{"area":1,"value":1},"se":{"area":1,"value":1}},"se":{"nw":{"area":1,"value":1},"ne":{"area":1,"value":1},"sw":{"area":1,"value":1},"se":{"area":1.6399999999999997,"value":1.6399999999999997}}}}';
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 3, expected);
});

test("zoom 3 small x 2", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"area":0.0032,"value":0.0032}},"se":{"ne":{"area":0.00006400000000000012,"value":0.00006400000000000012}}}}';
  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 3, expected);
});

test("zoom 4 small x 2", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"nw":{"area":0.0128,"value":0.0128}}},"se":{"ne":{"nw":{"area":0.0002560000000000005,"value":0.0002560000000000005}}}}}';
  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 4, expected);
});

test("zoom 16 covers much", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"nw":{"area":0.0128,"value":0.0128}}},"se":{"ne":{"nw":{"area":0.0002560000000000005,"value":0.0002560000000000005}}}}}';
  const input = [[0.5, 0.5, 1, 1]];
  buildqt(input, 3, expected);
});

test("zoom 1 quarter offset", () => {
  const expected =
    '{"nw":{"area":0.64,"value":0.64},"ne":{"area":0.15999999999999998,"value":0.15999999999999998},"sw":{"area":0.15999999999999998,"value":0.15999999999999998},"se":{"area":0.03999999999999998,"value":0.03999999999999998}}';
  const input = [0.1, 0.1, 0.6, 0.6];
  buildqt([input], 1, expected);
});

function buildqt(items, zoom, expected) {
  const tree = {};
  items.forEach(item => quadtree.add(tree, item, zoom, 1));
  expect(JSON.stringify(tree)).toBe(expected);
}
