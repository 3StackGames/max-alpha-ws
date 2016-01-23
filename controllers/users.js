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

var NO_CHANGES_ERROR = new Error('No Changes Submitted')
var NO_CHANGES_RESPONSE = new Response(null, NO_CHANGES_ERROR)

var NO_DELETE_ACCESS_ERROR = new Error('No Access', 'Authenticated user doesn\'t have permission to delete user')
var NO_DELETE_ACCESS_RESPONSE = new Response(null, NO_DELETE_ACCESS_ERROR)

var MISSING_PROPERTIES_ERROR = new Error(INVALID_PROPERTIES, 'Missing either username or password')
var MISSING_PROPERTIES_RESPONSE = new Response(null, MISSING_PROPERTIES_ERROR)

mod.get = function (req, res) {
    var userId = req.query.userId
    var username = cleanUsername(req.query.username)
    var query = {}
    if(userId) {
        query._id = userId
    } else if(username) {
        query.username = username
    }
    User.find(query, function(err, users) {
        if (err) throw err
        
        var processedUsers = users.map(function(user) {
            return user.process()
        })
        res.json(new Response(processedUsers))
    })
}

mod.post = function (req, res) {
    var username = req.username
    var password = req.password
    
    //make sure both username and password are provided
    if(!username && !password) {
        res.status(400).json(MISSING_PROPERTIES_RESPONSE)
        return
    }
    
    var newUser = new User({
        username: username,
        password: password,
        active: true,
        cards: []
    })
    
    newUser.save(function(err, user) {
        if (err) throw err
        
        var response = new Response(user.process('owner'))
        res.status(201).json(response)
    })
}

mod.put = function (req, res) {
    var username = req.username
    var password = req.password
    var user = req.user
    
    //check that at least a username or password is provided
    if(!username && !password) {
        res.status(400).json(NO_CHANGES_RESPONSE)
        return
    }
    //apply changes
    if(username) user.username = username
    if(password) user.password = password
    
    user.save(function(err, user) {
        res.json(new Response(user.process('owner')))
    })
    
}

mod.delete = function (req, res) {
    User.findById(req.userId, function(err, user) {
        user.active = false
        user.save(function(err, user) {
            res.status(204).send()
        })
    })
}
/**
 * Validation methods
 */
mod.processUsernameAndPassword = function (req, res, next) {
    var username = cleanUsername(req.body.username)
    var password = req.body.password
    
    if(username && !isValidUsername(username)) {
        res.status(400).json(new Response(null, USERNAME_LENGTH_ERROR))
        return
    } else if(password && !isValidPassword(password)) {
        res.status(400).json(new Response(null, PASSWORD_LENGTH_ERROR))
        return
    }
    
    req.username = username
    req.password = password
    next()
}

mod.isUsernameTaken = function (req, res, next) {
    var username = req.username
    if(!username) {
        next()
        return
    }
    
    userService.isUsernameTaken(username)
    .then(function(isTaken) {
        if(isTaken) res.status(400).json(new Response(null, USERNAME_TAKEN_ERROR))
        else next()
    })  
}

mod.getUserForModification = function (req, res, next) {
    var userId = req.body.id
    var currentUserId = req.userId
    User.findById(userId, function(err, user) {
        if(err) throw err
        
        if(!user) {
            res.status(404).json(USER_NOT_FOUND_RESPONSE)
            return
        }
        
        if(!user.owner.equals(currentUserId)) {
            res.status(403).json(NO_DELETE_ACCESS_RESPONSE)
            return
        }
        req.user = user
        next()
    })
}

/**
 * Helper Methods
 */
function cleanUsername(username) {
    if(username) return username.toLowerCase().trim()
    else return null
}

function isValidUsername(username) {
    return username && username.length >= User.USERNAME_LENGTH.min && username.length <= User.USERNAME_LENGTH.max
}

function isValidPassword(password) {
    return password && password.length >= User.PASSWORD_LENGTH.min && password.length <= User.PASSWORD_LENGTH.max
}