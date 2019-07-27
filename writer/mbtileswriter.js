const { log } = require("lastejobb");
const { writeExec, readdb, writedb } = require("./sqlite");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const path = require("path");

async function readTile(db, key) {
  log.debug(`Read tile ${key}`);
  const sql = "SELECT tile_data FROM tiles WHERE key=?";
  await readdb(db, sql, [key]);
}

async function writeTile(db, key, buffer) {
  log.debug(`Write tile ${key}`);
  const sql = "INSERT INTO tiles VALUES (?,?);";
  writedb(db, sql, [key, buffer]);
}

async function updateTile(node, db, config, key) {
  const tile = await readTile(db, key);
  const o = tile ? JSON.parse(tile) : {};
  o[config.name] = node;
  writeTile(db, key, JSON.stringify(o));
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

function writeChild(tree, directory, config, key, direction) {
  const node = tree[direction];
  write(node, directory, config, key + directionToKey[direction]);
}

function write(node, db, config, key) {
  if (!node) return;
  updateTile(node, db, config, key);
  writeChild(node, db, config, key, "nw");
  writeChild(node, db, config, key, "ne");
  writeChild(node, db, config, key, "sw");
  writeChild(node, db, config, key, "se");
}

async function openOrCreateDatabase(directory) {
  const sqlitePath = path.join(directory, "index.sqlite");
  log.info("Writing tiles to " + sqlitePath);
  if (fs.existsSync(sqlitePath)) return await open(sqlitePath);
  return await createMbtile(sqlitePath, {});
}

async function writeAll(node, directory, config) {
  const db = await openOrCreateDatabase(directory);
  write(node, db, config, "");
}

module.exports = { open, readTile, writeAll, createMbtile, createIndex };
