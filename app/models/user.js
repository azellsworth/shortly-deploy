var db = require('../config');
var Promise = require('bluebird');

var User = db.model('User', db.userSchema);

module.exports = User;
