const { log } = require("lastejobb");
const { each, writeExec, readdb, writedb } = require("./sqlite");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const path = require("path");

async function readTile(db, key) {
  log.debug(`Read tile ${key}`);
  const sql = "SELECT tile_data FROM tiles WHERE key=?";
  return await readdb(db, sql, [key]);
}

async function writeTile(db, key, buffer) {
  log.debug(`Create tile ${key}`);
  const sql = "INSERT INTO tiles VALUES (?,?);";
  await writedb(db, sql, [key, buffer]);
}

async function updateTile(node, sourceDb, targetDb, config, key) {
  const tile = sourceDb && (await readTile(sourceDb, key));
  const o = tile ? JSON.parse(tile.tile_data) : {};

  o[config.name] = {
    v: node.v,
    min: node.min,
    max: node.max,
    var: node.var
    //    n: node.n
  };

  writeTile(targetDb, key, JSON.stringify(o));
}

function open(file, flags = sqlite3.OPEN_READWRITE) {
  return new sqlite3.Database(file, flags, err => {
    if (err) throw new Error(err);
  });
}

async function createMbtile(file, metadata) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = open(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
  await writeExec(db, "CREATE TABLE metadata (name text, value text);");
  await writeExec(db, "CREATE TABLE tiles (key text, tile_data blob);");

  Object.keys(metadata).forEach(key => {
    const value = metadata[key];
    writedb(db, "INSERT INTO metadata VALUES (?,?)", [key, value]);
  });

  return db;
}

async function createIndex(db) {
  await writeExec(db, "CREATE UNIQUE INDEX tile_index on tiles (key);");
}

const directionToKey = { nw: 0, ne: 1, sw: 2, se: 3 };
const keyToDirection = { 0: "nw", 1: "ne", 2: "sw", 3: "se" };

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

async function openPrevious(directory) {
  const sqlitePath = path.join(directory, "index.sqlite");
  log.info("Merging with tiles from " + sqlitePath);
  if (!fs.existsSync(sqlitePath)) return null;
  return await open(sqlitePath, sqlite3.OPEN_READONLY);
}

async function createTargetDatabase(directory) {
  const sqlitePath = path.join(directory, "new.sqlite");
  if (fs.existsSync(sqlitePath))
    throw new Error("Target database already exists: " + sqlitePath);
  log.info("Writing tiles to " + sqlitePath);
  const db = await createMbtile(sqlitePath, {});
  return db;
}

function hasKey(key, tree) {
  if (key.length === 0) return true;
  const dir = key[0];
  key = key.substring(1);
  const child = tree[keyToDirection[dir]];
  if (!child) return false;
  return hasKey(key, child);
}

function copyFromSource(src, target, tree) {
  const sql = "SELECT * FROM TILES";
  each(src, sql, e => {
    if (!hasKey(e.key, tree)) {
      writeTile(target, e.key, e.tile_data);
      console.log(e.key);
    }
  });
}

async function writeAll(node, directory, config) {
  const source = await openPrevious(directory);
  const target = await createTargetDatabase(directory);
  write(node, source, target, config, "");
  copyFromSource(source, target, node);
  createIndex(target);
  //  if (source) source.close();
  //  target.close();
}

module.exports = { open, readTile, writeAll, createMbtile, createIndex };
