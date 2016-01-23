var mongoose = require('mongoose')

var Schema = mongoose.Schema

var CardSchema = new Schema({
    name: String,
    type: String,
    cost: {
        red: Number,
        black: Number,
        green: Number,
        white: Number,
        yellow: Number,
        blue: Number,
        colorless: Number
    },
    text: String,
    flavorText: String,
    attack: Number,
    health: Number
}, {
    collection: 'cards'
})

CardSchema.methods.process = function() {
    var obj = this.toObject()
    //add
    obj.id = obj._id
    //remove
    delete obj._id
    delete obj.__v
    delete obj.effects
    return obj
}

module.exports = mongoose.model('Card', CardSchema)