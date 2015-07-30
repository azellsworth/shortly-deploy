var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, function(err, links) {
    if (err) throw err;

    console.log(links);
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({url: uri}, function(err, link){
    if(err) throw err;
    
    if(link){
      res.send(200, link)
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        console.log('REQ HEADERS ORIGIN -----------', req.headers);

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save(function(err) {
          if (err) throw err;
          res.send(200, link);
        });
      });

    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user){
    if (err) throw err;
    if (!user){
      res.redirect('/login');
    } else {
      // compare the password
      user.comparePassword(password, function(match) {        
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  // Check if user already exists
  User.findOne({username: username}, function(err, user){
    if (err) throw err;
    if (!user){
    // if no, create a new user (with hashed password), create session, redirect to homepage
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function(err){
        if (err) throw err;
        util.createSession(req, res, newUser);
      });
    } else {
      // if yes, return error/console.log, redirect to signup
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}, function(err, link){
    if (err) throw err;

    if (!link) {
      res.redirect('/');
    } else {
      link.visits += 1;

      link.save(function(err) {
        if (err) throw err;
        return res.redirect(link.url);
      });
    }
  });
};