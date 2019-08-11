const { log } = require("lastejobb");
const fs = require("fs");
const sqlite3 = require("better-sqlite3");
const lastejobb = require("lastejobb");
const path = require("path");

class MbtilesWriter {
  statement = {};

  constructor(directory) {
    const db = this.openDatabase(directory);
    this.statement = {
      selectTile: db.prepare("SELECT tile_data FROM tiles WHERE key=?"),
      updateTile: db.prepare("UPDATE tiles SET tile_data=? WHERE KEY=?;"),
      insertTile: db.prepare("INSERT INTO tiles VALUES (?,?);")
    };
    this.db = db;
  }

  readTile(key) {
    return this.statement.selectTile.get(key);
  }

  writeTile(key, buffer, exists) {
    if (exists) this.statement.updateTile.run(buffer, key);
    else this.statement.insertTile.run(key, buffer);
  }

  updateTile(node, layer, key) {
    const tile = this.readTile(key);
    const exists = !!tile;
    const o = tile ? JSON.parse(tile.tile_data) : {};

    if (node.v) {
      const v = node.v;
      o[layer.name] = {
        v: node.v,
        min: node.min,
        max: node.max,
        var: node.var
      };
    }

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
    db.exec("CREATE UNIQUE INDEX tile_index on tiles (key);");

    Object.keys(metadata).forEach(key => {
      const value = metadata[key];
      const stmt = db.prepare("INSERT INTO metadata VALUES (?,?)");
      stmt.run(key, value);
    });

    return db;
  }

  directionToKey = { nw: 0, ne: 1, sw: 2, se: 3 };

  writeChild(tree, layer, key, direction) {
    const node = tree[direction];
    this.write(node, layer, key + this.directionToKey[direction]);
  }

  write(node, layer, key) {
    if (!node) return;
    this.updateTile(node, layer, key);
    this.writeChild(node, layer, key, "nw");
    this.writeChild(node, layer, key, "ne");
    this.writeChild(node, layer, key, "sw");
    this.writeChild(node, layer, key, "se");
  }

  openDatabase(directory) {
    const sqlitePath = path.join(directory, "index.sqlite");
    log.info("Merging with tiles from " + sqlitePath);
    if (!fs.existsSync(sqlitePath)) return this.createMbtile(sqlitePath, {});
    return new sqlite3(sqlitePath);
  }

  writeAll(node, layer) {
    log.info("Writing tiles...");
    this.db.exec("PRAGMA synchronous = OFF");
    this.db.exec("BEGIN");
    // this.db.exec("PRAGMA journal_mode = MEMORY")
    this.write(node, layer, "");
    this.db.exec("COMMIT");
    log.info("Done.");
  }
}

module.exports = MbtilesWriter;
