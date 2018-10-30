var bcrypt = require("bcrypt");
var config = require("config");

function hash_password(password) {
    var saltRounds = config.get("salt");
    var salt = bcrypt.genSalt(saltRounds);
    var hash = bcrypt.hash(password, salt);

    return hash;
}

function compare_password(password, hash) {
    return bcrypt.compare(password, hash);
}


module.exports = {
    hash_password:hash_password,
    compare_password:compare_password
}