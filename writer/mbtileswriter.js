const { log } = require("lastejobb");
const fs = require("fs");
const sqlite3 = require("better-sqlite3");
const lastejobb = require("lastejobb");
const path = require("path");

function readTile(db, key) {
  const stmt = db.prepare("SELECT tile_data FROM tiles WHERE key=?");
  const r = stmt.get(key);
  return r;
}

function writeExec(db, sql, args) {
  const stmt = db.prepare(sql);
  stmt.run(...args);
}

function writeTile(db, key, buffer, exists) {
  if (exists) {
    const stmt = db.prepare("UPDATE tiles SET tile_data=? WHERE KEY=?;");
    stmt.run(buffer, key);
  } else {
    const stmt = db.prepare("INSERT INTO tiles VALUES (?,?);");
    stmt.run(key, buffer);
  }
}

function updateTile(node, sourceDb, targetDb, config, key) {
  const tile = sourceDb && readTile(sourceDb, key);
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
  if (json !== tile) writeTile(targetDb, key, json, exists);
}

function createMbtile(file, metadata) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = sqlite3(file);
  writeExec(db, "CREATE TABLE metadata (name text, value text);");
  writeExec(db, "CREATE TABLE tiles (key text, tile_data blob);");

  Object.keys(metadata).forEach(key => {
    const value = metadata[key];
    const stmt = db.prepare("INSERT INTO metadata VALUES (?,?)");
    stmt.run(key, value);
  });

  return db;
}

function createIndex(db) {
  writeExec(db, "CREATE UNIQUE INDEX tile_index on tiles (key);");
}

const directionToKey = { nw: 0, ne: 1, sw: 2, se: 3 };

function writeChild(tree, sourceDb, targetDb, config, key, direction) {
  const node = tree[direction];
  write(node, sourceDb, targetDb, config, key + directionToKey[direction]);
}

function write(node, sourceDb, targetDb, config, key) {
  if (!node) return;
  updateTile(node, sourceDb, targetDb, config, key);
  writeChild(node, sourceDb, targetDb, config, key, "nw");
  writeChild(node, sourceDb, targetDb, config, key, "ne");
  writeChild(node, sourceDb, targetDb, config, key, "sw");
  writeChild(node, sourceDb, targetDb, config, key, "se");
}

function openPrevious(directory) {
  const sqlitePath = path.join(directory, "index.sqlite");
  log.info("Merging with tiles from " + sqlitePath);
  if (!fs.existsSync(sqlitePath)) return null;
  return new sqlite3(sqlitePath);
}

function writeAll(node, directory, config) {
  const source = openPrevious(directory);
  const target = source;
  log.info("Writing tiles...");
  write(node, source, target, config, "");
}

module.exports = { readTile, writeAll, createMbtile, createIndex };
