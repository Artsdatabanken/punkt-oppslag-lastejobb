const fs = require("fs");
const path = require("path");
const { io } = require("lastejobb");

function readExisting(datapath) {
  if (!fs.existsSync(datapath)) return {};
  const data = fs.readFileSync(datapath);
  return JSON.parse(data);
}
function writeFile(datapath, data) {
  fs.writeFileSync(datapath, JSON.stringify(data));
}

function updateFile(node, datapath, config) {
  io.mkdir(datapath);
  const filePath = path.join(datapath, "index.json");
  const data = readExisting(filePath);
  data[config.name] = {
    v: node.v,
    min: node.min,
    max: node.max,
    var: node.var
    //    n: node.n
  };
  writeFile(filePath, data);
}

function writeChild(tree, directory, config, direction) {
  const node = tree[direction];
  directory += "/" + direction;
  write(node, directory, config);
}

function write(tree, directory, config) {
  if (!tree) return;
  updateFile(tree, directory, config);
  writeChild(tree, directory, config, "nw");
  writeChild(tree, directory, config, "ne");
  writeChild(tree, directory, config, "sw");
  writeChild(tree, directory, config, "se");
}

module.exports = { write };
