var mongoose = require('mongoose')

var Schema = mongoose.Schema

var DeckSchema = new Schema({
    name: String,
    owner: Schema.Types.ObjectId,
    mainCards: [Schema.Types.ObjectId],
    structures: [Schema.Types.ObjectId]
}, {
    collection: 'decks'
})

DeckSchema.methods.process = function() {
    var obj = this.toObject()
    //add
    obj.id = obj._id
    obj.type = 'decks'
    //remove
    delete obj._id
    delete obj.__v
    return obj
}

DeckSchema.statics.NAME_LENGTH = {
    min: 1,
    max: 20
}

module.exports = mongoose.model('Deck', DeckSchema)