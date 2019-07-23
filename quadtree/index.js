const build = require("./build");
const query = require("./query");
const compact = require("./compact");

module.exports = { add: build.add, find: query.find, compact };
