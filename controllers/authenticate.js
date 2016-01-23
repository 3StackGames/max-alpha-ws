var mod = module.exports = {}

var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

var config = require('../config')
var Response = require('../models/response')
var Error = require('../models/error')
var User = require('../models/user')
var userService = require('../modules/userService')

var BAD_AUTH_ERROR = new Error('Authentication Failed', 'Invalid username and/or password')
var BAD_AUTH_RESPONSE = new Response(null, BAD_AUTH_ERROR)

mod.login = function(req, res) {
    User.findOne({
        username: req.body.username.toLowerCase()
    }, function(err, user) {
        if (err) throw err

        if (!user) {
            res.status(400).json(BAD_AUTH_RESPONSE)
        } else if (user) {
            // check if password matches
            bcrypt.compare(req.body.password, user.password, function(err, isCorrect) {
                if(!isCorrect) res.status(400).json(BAD_AUTH_RESPONSE)
                else { 
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({ name: user.name, username: user.username }, config.SECRET, {
                    expiresIn: '2 days' // expires in 24 hours
                    })

                    // return the user with the token
                    var filteredUser = userService.filterAuthenticated(user, token)
                    var response = new Response(filteredUser)
                    res.json(response)
                }
            })
        }
    })
}

mod.isAuthenticated = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    
    if(!token) res.status(403).send({
        message: 'No token provided.'
    })
    
    // verifies secret and checks exp
    jwt.verify(token, config.SECRET, function(err, decoded) {      
        if (err) res.status(400).json({
            success : false,
            message: 'Failed to authenticate token.'
        })
        
        // since everything is good, save to request for use in other routes
        req.decoded = decoded    
        next()
    })
}