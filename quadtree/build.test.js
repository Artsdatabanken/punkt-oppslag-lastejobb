const quadtree = require("./index");

test("zoom 0 quarter", () => {
  const expected = '{"p":0.25,"v":0.25}';
  const input = [0.0, 0.0, 0.5, 0.5];
  debugger;
  buildqt([input], 0, expected);
});

test("zoom 0 quarter offset", () => {
  const expected = '{"p":0.25,"v":0.25}';
  const input = [0.1, 0.1, 0.6, 0.6];
  buildqt([input], 0, expected);
});

test("zoom 1 quarter", () => {
  const expected = '{"nw":{"p":1,"v":1}}';
  const input = [0.0, 0.0, 0.5, 0.5];
  buildqt([input], 1, expected);
});

test("zoom 1 double quarter", () => {
  const expected = '{"nw":{"p":1.04,"v":1.04}}';
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 1, expected);
});

test("zoom 2 double quarter", () => {
  const expected =
    '{"nw":{"p":1,"v":1,"se":{"p":0.15999999999999992,"v":0.15999999999999992}}}';
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 2, expected);
});

test("zoom 3 double quarter", () => {
  const expected =
    '{"nw":{"p":1,"v":1,"se":{"se":{"p":0.6399999999999997,"v":0.6399999999999997}}}}';
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 3, expected);
});

test("zoom 3 small x 2", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"p":0.0032,"v":0.0032}},"se":{"ne":{"p":0.00006400000000000012,"v":0.00006400000000000012}}}}';
  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 3, expected);
});

test("zoom 4 small x 2", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"nw":{"p":0.0128,"v":0.0128}}},"se":{"ne":{"nw":{"p":0.0002560000000000005,"v":0.0002560000000000005}}}}}';
  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 4, expected);
});

test("zoom 16 covers much", () => {
  const expected = '{"se":{"p":1,"v":1}}';
  const input = [[0.5, 0.5, 1, 1]];
  buildqt(input, 3, expected);
});

test("zoom 1 quarter offset", () => {
  const expected =
    '{"nw":{"p":0.36,"v":0.36},"sw":{"p":0.11999999999999997,"v":0.11999999999999997}}';

  const input = [0.2, 0.2, 0.5, 0.6];
  buildqt([input], 1, expected);
});

function buildqt(items, zoom, expected) {
  const tree = {};
  items.forEach(item => quadtree.add(tree, item, zoom, 1));
  expect(JSON.stringify(tree)).toBe(expected);
}
