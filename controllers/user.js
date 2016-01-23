var mod = module.exports = {}

var bcrypt = require('bcrypt')

var Response = require('../models/response')
var Error = require('../models/error')
var User = require('../models/user')
var userService = require('../modules/userService')

var INVALID_PROPERTIES = 'Invalid Properties'
var USERNAME_TAKEN_ERROR = new Error(INVALID_PROPERTIES, 'Username Taken')

var USERNAME_LENGTH_ERROR = new Error(INVALID_PROPERTIES, 'Username Length Too Long or Short')

var PASSWORD_LENGTH_ERROR = new Error(INVALID_PROPERTIES, 'Password Length Too Long or Short')

var USER_NOT_FOUND_ERROR = new Error('User Not Found')
var USER_NOT_FOUND_RESPONSE = new Response(null, USER_NOT_FOUND_ERROR)
/* API Welcome */
mod.isUsernameTaken = function (req, res, next) {
    var username = cleanUsername(req.body.username)
    
    userService.isUsernameTaken(username)
    .then(function(isTaken) {
        if(isTaken) res.status(400).json(new Response(null, USERNAME_TAKEN_ERROR))
        else next()
    })  
}

mod.post = function (req, res) {
    var username = cleanUsername(req.body.username)
    var password = req.body.password
    
    if(username.length < User.USERNAME_LENGTH.min || username.length > User.USERNAME_LENGTH.max) {
        res.status(400).json(new Response(null, USERNAME_LENGTH_ERROR))
        return
    } else if(password.length < User.PASSWORD_LENGTH.min || password.length > User.PASSWORD_LENGTH.max) {
        res.status(400).json(new Response(null, PASSWORD_LENGTH_ERROR))
        return
    }
    
    var newUser = new User({
        username: username,
        password: password,
        active: true,
        cards: []
    })
    
    newUser.save(function(err, user) {
        if (err) throw err;
              
        var response = new Response(userService.filterPublic(user))
        res.status(201).json(response)
    })
}

mod.get = function (req, res) {
    if(req.query.userId) {
        User.findById(req.query.userId, function(err, user) {
            if(err) {
                res.json(USER_NOT_FOUND_RESPONSE)
                return
            }
            var filteredUser = userService.filterPublic(user);
            res.json(new Response([filteredUser]))
        })
    } else if(req.query.username) {
        var username = cleanUsername(req.query.username)
        User.findOne({ username: username}, function(err, user) {
            if(err) {
                res.json(USER_NOT_FOUND_RESPONSE)
                return
            }
            var filteredUser = userService.filterPublic(user);
            res.json(new Response([filteredUser]))
        })
    } else {
        User.find().exec(function(err, users) {
            if(err) throw err
            res.json(new Response(users.map(userService.filterPublic)))
        })
    }
}

function cleanUsername(username) {
    return username.toLowerCase().trim()
}