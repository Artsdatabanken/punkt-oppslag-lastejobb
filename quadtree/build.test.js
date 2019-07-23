const quadtree = require("./index");

test("zoom 0 quarter", () => {
  const expected = '{"v":1,"p":0.25,"min":1,"max":1}';

  const input = [0.0, 0.0, 0.5, 0.5];
  debugger;
  buildqt([input], 0, expected);
});

test("zoom 0 quarter offset", () => {
  const expected = '{"v":1,"p":0.25,"min":1,"max":1}';
  const input = [0.1, 0.1, 0.6, 0.6];
  buildqt([input], 0, expected);
});

test("zoom 1 quarter", () => {
  const expected = '{"nw":{"v":1,"p":1,"min":1,"max":1}}';

  const input = [0.0, 0.0, 0.5, 0.5];
  buildqt([input], 1, expected);
});

test("zoom 1 double quarter", () => {
  const expected =
    '{"nw":{"v":0.9999999999999999,"p":1.04,"min":0.9999999999999999,"max":0.9999999999999999}}';

  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 1, expected);
});

test("zoom 2 double quarter", () => {
  const expected =
    '{"nw":{"v":1,"p":1,"min":1,"max":1,"se":{"v":1,"p":0.15999999999999992,"min":1,"max":1}}}';
  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 2, expected);
});

test("zoom 3 double quarter", () => {
  const expected =
    '{"nw":{"v":1,"p":1,"min":1,"max":1,"se":{"se":{"v":1,"p":0.6399999999999997,"min":1,"max":1}}}}';

  const input = [[0.0, 0.0, 0.5, 0.5], [0.4, 0.4, 0.5, 0.5]];
  buildqt(input, 3, expected);
});

test("zoom 3 small x 2", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"v":1,"p":0.0032,"min":1,"max":1}},"se":{"ne":{"v":1,"p":0.00006400000000000012,"min":1,"max":1}}}}';

  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 3, expected);
});

test("zoom 4 small x 2", () => {
  const expected =
    '{"nw":{"nw":{"nw":{"nw":{"v":1,"p":0.0128,"min":1,"max":1}}},"se":{"ne":{"nw":{"v":1,"p":0.0002560000000000005,"min":1,"max":1}}}}}';
  const input = [[0.0, 0.0, 0.05, 0.001], [0.4, 0.3, 0.401, 0.301]];
  buildqt(input, 4, expected);
});

test("zoom 16 covers much", () => {
  const expected = '{"se":{"v":1,"p":1,"min":1,"max":1}}';
  const input = [[0.5, 0.5, 1, 1]];
  buildqt(input, 3, expected);
});

test("zoom 1 quarter offset", () => {
  const expected =
    '{"nw":{"v":1,"p":0.36,"min":1,"max":1},"sw":{"v":1,"p":0.11999999999999997,"min":1,"max":1}}';

  const input = [0.2, 0.2, 0.5, 0.6];
  buildqt([input], 1, expected);
});

function buildqt(items, zoom, expected) {
  const tree = {};
  items.forEach(item => quadtree.add(tree, item, zoom, 1));
  expect(JSON.stringify(tree)).toBe(expected);
}
