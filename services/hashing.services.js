const bcrypt = require("bcrypt");

async function checkPassword({ hash, password }) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  checkPassword,
};
