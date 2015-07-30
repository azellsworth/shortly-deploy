var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var db = mongoose.connection;

// connect
// TODO: configure for local/production variables
mongoose.connect('mongodb://localhost/db');

// handle errors
db.on('error', console.error.bind(console, 'connection error:'));

// user schema
db.userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  created_at: Date,
  updated_at: Date
});

db.userSchema.pre('save', function(next) {
  if (this.isNew) {
    bcrypt.hash(this.password, null, null, function(err, hash) {
      this.password = hash;
      next();
    }.bind(this));
  } else {
    next();
  }
});

// link schema
db.linkSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number,
  created_at: Date,
  updated_at: Date
});

db.linkSchema.pre('save', function(next){
  // handle dates
  var currentDate = new Date();
  if(!this.created_at) this.created_at = currentDate;
  this.updated_at = currentDate;

  // handle code
  if (this.isNew) {
    var shasum = crypto.createHash('sha1');
    shasum.update(this.url);
    this.code = shasum.digest('hex').slice(0, 5);
  }

  next();
});




// var Bookshelf = require('bookshelf');
// var path = require('path');

// var db = Bookshelf.initialize({
//   client: 'sqlite3',
//   connection: {
//     host: '127.0.0.1',
//     user: 'your_database_user',
//     password: 'password',
//     database: 'shortlydb',
//     charset: 'utf8',
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('base_url', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

module.exports = db;
