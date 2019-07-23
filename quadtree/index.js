const build = require("./build");
const query = require("./query");
const compact = require("./compact");
const statistics = require("./statistics");
const pyramid = require("./pyramid");

module.exports = {
  add: build.add,
  addPyramid: pyramid.build,
  find: query.find,
  compact,
  statistics
};
