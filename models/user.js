var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var Schema = mongoose.Schema

var UserSchema = new Schema({
    username: String,
    password: String,
    active: Boolean,
    cards: [Schema.Types.ObjectId]
}, {
    collection: 'users'
})

UserSchema.pre('save', function(next) {
    var user = this
    
    if(!user.isNew) next()    
    
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err)
        
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)
            
            user.password = hash
            next()
        })
    })
})

UserSchema.methods.usernameTaken = function (username, cb) {
    UserSchema.findOne({ 'username' : username }, function (err, user) {
        if(err) throw err
        
        if(user) cb(false)
        
        return cb(true)
    })
}

module.exports = mongoose.model('User', UserSchema)