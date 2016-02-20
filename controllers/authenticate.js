var mod = module.exports = {}

var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var mongoose = require('mongoose')

var config = require('../config')
var Response = require('../models/response')
var Error = require('../models/error')
var User = require('../models/user')
var userService = require('../modules/userService')

var BAD_AUTH_ERROR = new Error('Authentication Failed', 'Invalid username and/or password')
var BAD_AUTH_RESPONSE = new Response(null, BAD_AUTH_ERROR)

var NOT_AUTHENTICATED = 'Not Authenticated'

var NO_TOKEN_ERROR = new Error(NOT_AUTHENTICATED, 'No token was provided')
var NO_TOKEN_RESPONSE = new Response(null, NO_TOKEN_ERROR)

var AUTHENTICATION_FAILED_ERROR = new Error(NOT_AUTHENTICATED, 'Unable to verify token provided')
var AUTHENTICATION_FAILED_RESPONSE = new Response(null, AUTHENTICATION_FAILED_ERROR)

var USER_DELETED_ERROR = new Error(NOT_AUTHENTICATED, 'User deleted')
var USER_DELETED_RESPONSE = new Response(null, USER_DELETED_ERROR)

mod.login = function(req, res) {
    if(!req.body.username) {
        res.status(400).json(BAD_AUTH_RESPONSE)
        return
    }
    User.findOne({
        username: req.body.username.toLowerCase()
    }, function(err, user) {
        if (err) throw err

        if (!user) {
            res.status(400).json(BAD_AUTH_RESPONSE)
        } else if (user) {
            if(!user.active) {
                res.json(USER_DELETED_RESPONSE)
                return
            }
            // check if password matches
            bcrypt.compare(req.body.password, user.password, function(err, isCorrect) {
                if(!isCorrect) res.status(400).json(BAD_AUTH_RESPONSE)
                else { 
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({ userId: user._id }, config.SECRET, {
                        expiresIn: '2 days' // expires in 24 hours
                    })

                    // return the user with the token
                    var response = new Response(user.process('owner', token))
                    res.json(response)
                }
            })
        }
    })
}

mod.isAuthenticated = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    
    if(!token) {
        res.status(403).send(NO_TOKEN_RESPONSE)
        return
    }
    
    // verifies secret and checks exp
    jwt.verify(token, config.SECRET, function(err, decoded) {      
        if (err || !decoded.userId) {
            res.status(403).json(AUTHENTICATION_FAILED_RESPONSE)
            return
        }
        
        // since everything is good, save to request for use in other routes
        try {
            req.userId = new mongoose.Types.ObjectId(decoded.userId)
        } catch (err) {
            res.status(403).json(AUTHENTICATION_FAILED_RESPONSE)
            return
        }
        
        //make sure user isn't inactive
        User.findById(req.userId, function(err, user) {
            if(err) throw err
            
            if(!user.active) {
                res.status(403).json(USER_DELETED_ERROR)
                return
            }
            next()
        })
    })
}