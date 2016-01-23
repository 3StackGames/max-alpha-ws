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

UserSchema.statics.USERNAME_LENGTH = {
    min: 1,
    max: 20
}

UserSchema.statics.PASSWORD_LENGTH = {
    min: 3,
    max: 20
}

module.exports = mongoose.model('User', UserSchema)