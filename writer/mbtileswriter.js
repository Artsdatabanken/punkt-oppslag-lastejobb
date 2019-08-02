const { log } = require("lastejobb");
const { each, writeExec, readdb, writedb } = require("./sqlite");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const lastejobb = require("lastejobb");
const path = require("path");

async function readTile(db, key) {
  //  log.debug(`Read tile ${key}`);
  const sql = "SELECT tile_data FROM tiles WHERE key=?";
  const r = await readdb(db, sql, [key]);
  //log.debug(`Read tile ${key} OK`);
  return r;
}

async function writeTile(db, key, buffer, exists) {
  // log.debug(`Create tile ${key}`);
  if (exists) {
    const sql = "UPDATE tiles SET tile_data=? WHERE KEY=?;";
    await writedb(db, sql, [buffer, key]);
  } else {
    const sql = "INSERT INTO tiles VALUES (?,?);";
    await writedb(db, sql, [key, buffer]);
  }
}

async function updateTile(node, sourceDb, targetDb, config, key) {
  const tile = sourceDb && (await readTile(sourceDb, key));
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
  if (json !== tile) await writeTile(targetDb, key, json, exists);
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

async function writeChild(tree, sourceDb, targetDb, config, key, direction) {
  const node = tree[direction];
  await write(
    node,
    sourceDb,
    targetDb,
    config,
    key + directionToKey[direction]
  );
}

async function write(node, sourceDb, targetDb, config, key) {
  if (!node) return;
  await updateTile(node, sourceDb, targetDb, config, key);
  await writeChild(node, sourceDb, targetDb, config, key, "nw");
  await writeChild(node, sourceDb, targetDb, config, key, "ne");
  await writeChild(node, sourceDb, targetDb, config, key, "sw");
  await writeChild(node, sourceDb, targetDb, config, key, "se");
}

async function openPrevious(directory) {
  const sqlitePath = path.join(directory, "index.sqlite");
  log.info("Merging with tiles from " + sqlitePath);
  if (!fs.existsSync(sqlitePath)) return null;
  return await open(sqlitePath, sqlite3.OPEN_READWRITE || sqlite3.OPEN_CREATE);
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

async function copyFromSource(src, target, tree) {
  const sql = "SELECT * FROM TILES";
  await each(src, sql, e => {
    if (!hasKey(e.key, tree)) writeTile(target, e.key, e.tile_data);
  });
}

async function writeAll(node, directory, config) {
  const source = await openPrevious(directory);
  const target = source;
  //  const target = await createTargetDatabase(directory);
  log.info("Writing tiles...");
  await write(node, source, target, config, "");
  //  log.info("Copy old tiles...");
  //  await copyFromSource(source, target, node);
  //  createIndex(target);
  //  if (source) source.close();
  //  target.close();
}

module.exports = { open, readTile, writeAll, createMbtile, createIndex };
