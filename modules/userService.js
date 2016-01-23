var mod = module.exports = {}

var User = require('../models/user')

mod.isUsernameTaken = function (username) {
    return new Promise(function (resolve, reject) {
        User.findOne({ 'username' : username }, function (err, user) {
            if(err) throw err
            
            if(user) resolve(true)
            else resolve(false)
        })
    })
}

mod.filterPublic = function(user) {
    return {
        id: user._doc._id,
        type: 'users',
        username: user._doc.username,
        active: user._doc.active
    }
}

mod.filterAuthenticated = function(user, token) {
    return {
        id: user._doc._id,
        type: 'users',
        username: user._doc.username,
        active: user._doc.active,
        token: token
    }
}