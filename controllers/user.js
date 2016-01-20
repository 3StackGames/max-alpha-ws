var mod = module.exports = {}

var bcrypt = require('bcrypt')

var User = require('../models/user')
var userService = require('../modules/userService')

/* API Welcome */
mod.isUsernameTaken = function (req, res, next) {
    var username = req.body.username.toLowerCase()
    
    userService.isUsernameTaken(username)
    .then(function(isTaken) {
        if(isTaken) res.status(400).json({
            message: 'Username ' + username + ' taken'
        })
        else next()
    })  
}

mod.create = function (req, res) {
    var username = req.body.username.toLowerCase()
    
    var newUser = new User({
        username: username,
        password: req.body.password,
        active: true,
        cards: []
    })
    
    newUser.save(function(err) {
        if (err) throw err;
                
        var message = 'User ' + username + ' created'
        
        res.status(201).json({
            message: message
        })
    })
}

mod.show = function (req, res) {
    User.find().exec(function(err, users) {
        if(err) throw err
        var filteredUsers = users.map(function (user) {
            return {
                username: user.username
            }
        })
        res.json(filteredUsers)
    })
}