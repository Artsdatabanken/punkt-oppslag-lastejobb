const build = require("./build");
const query = require("./query");

module.exports = { add: build.add, find: query.find };
