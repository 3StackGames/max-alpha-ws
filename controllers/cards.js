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

var USER_NOT_FOUND_ERROR = new Error(INVALID_PROPERTIES, 'User not found')
var USER_NOT_FOUND_RESPONSE = new Response(null, USER_NOT_FOUND_ERROR)

var ID_INVALID_ERROR = new Error(INVALID_PROPERTIES, 'Either deckId or userId wasn\'t a valid object id')
var ID_INVALID_RESPONSE = new Response(null, ID_INVALID_ERROR)

var ILLEGAL_COMBINATION_ERROR = new Error(INVALID_PROPERTIES, 'Both deckId and userId were supplied. Only one is allowed at a time')
var ILLEGAL_COMBINATION_RESPONSE = new Response(null, ILLEGAL_COMBINATION_ERROR)

mod.get = function (req, res) {
    var deckId = req.query.deckId
    var userId = req.query.userId
    
    //make sure both aren't provided
    if(deckId && userId) {
        res.status(400).json(ILLEGAL_COMBINATION_RESPONSE)
        return
    }
    
    try {
        if(deckId) {
            deckId = new mongoose.Types.ObjectId(deckId)
        } else if(userId) {
            userId = new mongoose.Types.ObjectId(userId)
        }
    } catch (err) {
        res.status(400).json(ID_INVALID_RESPONSE)
        return
    }
    
    if(!deckId && !userId) {
        Card.find(function(err, cards) {
            var processedCards = cards.map(function(card) {
              return card.process()  
            })
            res.json(new Response(processedCards))
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
        User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
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
        ], function (err, users) {
            if (err) throw err
            if(users.length < 1) {
                res.status(404).json(USER_NOT_FOUND_RESPONSE)
                return
            }
            var cards = users[0].cards
            var processedCards = cards.map(function(card) {
                return Card.process(card)
            })
            
            res.json(new Response(processedCards))
        })
    }
}