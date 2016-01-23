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