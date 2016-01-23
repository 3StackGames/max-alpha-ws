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

UserSchema.methods.process = function(role, token) {
    var detailed = role === 'owner'
    var obj = this.toObject()
    //add
    obj.id = obj._id
    obj.type = 'users'
    if(token) obj.token = token
    //remove
    delete obj._id
    delete obj.password
    delete obj.__v
    if(!detailed) delete obj.cards
    return obj
}

UserSchema.statics.USERNAME_LENGTH = {
    min: 1,
    max: 20
}

UserSchema.statics.PASSWORD_LENGTH = {
    min: 3,
    max: 20
}

module.exports = mongoose.model('User', UserSchema)