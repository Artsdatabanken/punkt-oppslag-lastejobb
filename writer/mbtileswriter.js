const { log } = require("lastejobb");
const fs = require("fs");
const sqlite3 = require("better-sqlite3");
const lastejobb = require("lastejobb");
const path = require("path");

class MbtilesWriter {
  statement = {};

  constructor(directory) {
    debugger;
    const db = this.openDatabase(directory);
    this.statement = {
      selectTile: db.prepare("SELECT tile_data FROM tiles WHERE key=?"),
      updateTile: db.prepare("UPDATE tiles SET tile_data=? WHERE KEY=?;"),
      insertTile: db.prepare("INSERT INTO tiles VALUES (?,?);")
    };
    this.source = db;
  }

  readTile(key) {
    return this.statement.selectTile.get(key);
  }

  writeTile(key, buffer, exists) {
    if (exists) this.statement.updateTile.run(buffer, key);
    else this.statement.insertTile.run(key, buffer);
  }

  updateTile(node, config, key) {
    const tile = this.readTile(key);
    const exists = !!tile;
    const o = tile ? JSON.parse(tile.tile_data) : {};

    o[config.name] = {
      v: node.v,
      min: node.min,
      max: node.max,
      var: node.var
      //    n: node.n
    };

    let json = JSON.stringify(o);
    json = lastejobb.json.sortKeys(json);
    if (json !== tile) this.writeTile(key, json, exists);
  }

  createMbtile(file, metadata) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const db = sqlite3(file);
    db.exec("CREATE TABLE metadata (name text, value text);");
    db.exec("CREATE TABLE tiles (key text, tile_data blob);");

    Object.keys(metadata).forEach(key => {
      const value = metadata[key];
      const stmt = db.prepare("INSERT INTO metadata VALUES (?,?)");
      stmt.run(key, value);
    });

    return db;
  }

  createIndex(db) {
    db.exec("CREATE UNIQUE INDEX tile_index on tiles (key);");
  }

  directionToKey = { nw: 0, ne: 1, sw: 2, se: 3 };

  writeChild(tree, sourceDb, config, key, direction) {
    const node = tree[direction];
    this.write(node, sourceDb, config, key + this.directionToKey[direction]);
  }

  write(node, config, key) {
    if (!node) return;
    this.updateTile(node, config, key);
    this.writeChild(node, config, key, "nw");
    this.writeChild(node, config, key, "ne");
    this.writeChild(node, config, key, "sw");
    this.writeChild(node, config, key, "se");
  }

  openDatabase(directory) {
    const sqlitePath = path.join(directory, "index.sqlite");
    log.info("Merging with tiles from " + sqlitePath);
    if (!fs.existsSync(sqlitePath)) return this.createMbtile(sqlitePath, {});
    return new sqlite3(sqlitePath);
  }

  writeAll(node, config) {
    log.info("Writing tiles...");
    this.write(node, config, "");
  }
}

module.exports = MbtilesWriter;
