async function writeExec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err, records) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

async function readdb(db, sql, args = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, args, (err, row) => {
      if (err) return reject(err);
      return resolve(row);
    });
  });
}

async function each(db, sql, callback, args = []) {
  return new Promise((resolve, reject) => {
    db.each(
      sql,
      args,
      (err, row) => {
        if (err) return reject(err);
        callback(row);
      },
      complete => {
        debugger;
        resolve();
      }
    );
  });
}

async function writedb(db, sql, args = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, args, err => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

module.exports = { each, readdb, writeExec, writedb };
