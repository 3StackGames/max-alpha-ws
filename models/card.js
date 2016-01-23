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
    return processObject(this.toObject())
}

CardSchema.statics.process = function(card) {
    return processObject(card)
}

function processObject(card) {
    var processedCard = card
    //add
    processedCard.id = processedCard._id
    //remove
    delete processedCard._id
    delete processedCard.__v
    delete processedCard.effects
    return processedCard
}

module.exports = mongoose.model('Card', CardSchema)