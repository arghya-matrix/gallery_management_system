const bcrypt = require("bcrypt");
const generateNumber = require("../services/generateNumber");

async function hashPassword(req, res, next) {
  const number = generateNumber(2);
  const password = req.body.password;
  const saltRounds = number;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    console.log("inside hashing");
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        throw err;
      } else {
        req.password = hash;
        next();
      }
    });
  });
}

module.exports= {
    hashPassword
}