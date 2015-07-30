var db = require('../config');

var Link = db.model('Link', db.linkSchema);

module.exports = Link;
