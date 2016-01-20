var mod = module.exports = {}

var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

var config = require('../config')
var User = require('../models/user')

var BAD_AUTH = {
    message: 'Authentication failed. Username or Password were incorrect.'
}

mod.login = function(req, res) {
    User.findOne({
        username: req.body.username.toLowerCase()
    }, function(err, user) {
        if (err) throw err

        if (!user) {
            res.status(400).json(BAD_AUTH)
        } else if (user) {
            // check if password matches
            bcrypt.compare(req.body.password, user.password, function(err, isCorrect) {
                if(!isCorrect) res.status(400).json(BAD_AUTH)
                else { 
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({ name: user.name, username: user.username }, config.SECRET, {
                    expiresIn: '2 days' // expires in 24 hours
                    })

                    // return the information including token as JSON
                    res.json({
                        token: token
                    })
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