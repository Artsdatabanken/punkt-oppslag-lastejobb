const build = require("./build");
const query = require("./query");
const compact = require("./compact");
const statistics = require("./statistics");

module.exports = { add: build.add, find: query.find, compact, statistics };
