var mod = module.exports = {}

var mongoose = require('mongoose')

var Response = require('../models/response')
var Error = require('../models/error')
var Card = require('../models/card')
var Deck = require('../models/deck')
var User = require('../models/user')

var INVALID_PROPERTIES = 'Invalid Properties'

var DECK_NOT_FOUND_ERROR = new Error(INVALID_PROPERTIES, 'Deck not found')
var DECK_NOT_FOUND_RESPONSE = new Response(null, DECK_NOT_FOUND_ERROR)

var GET_DECK_CARDS = [
    {
        
    }
]
mod.get = function (req, res) {
    var deckId = req.query.deckId
    var userId = req.query.userId
    
    if(!deckId && !userId) {
        Card.find(function(err, cards) {
            res.json(new Response(cards))
        })
    } else if(deckId) {
        Deck.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(deckId)
                }
            },
            {
                $project: { 
                    mainCards: 1, 
                    structures: 1, 
                    cards: { $setUnion: [ "$mainCards", "$structures" ] },
                    _id: 0
                }
            },
            {
                $unwind: "$cards"
            },
            {
                $group: {
                    _id: "$cards"
                }
            },
            {
            $lookup: {
                from: "cards",
                localField: "_id",
                foreignField: "_id",
                as: "cards"
            }
            },
            {
                $unwind: "$cards"
            },
            { 
                $group: { 
                    _id: "_id", 
                    cards: { $push : "$cards" }
                }
            }
        ], function(err, decks) {
            if(err) throw err
            
            if(decks.length < 1) {
                res.status(404).json(DECK_NOT_FOUND_RESPONSE)
                return
            }
            
            var cards = decks[0].cards
            var processedCards = cards.map(function(card) {
                return Card.process(card)
            })
            
            res.json(new Response(processedCards))
        })
    } else if(userId) {
        
    }
}