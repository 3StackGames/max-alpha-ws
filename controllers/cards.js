var mod = module.exports = {}

var mongoose = require('mongoose')

var Response = require('../models/response')
var Error = require('../models/error')
var Card = require('../models/card')
var Deck = require('../models/deck')
var User = require('../models/user')

var INVALID_PROPERTIES = 'Invalid Properties'

mod.get = function (req, res) {
    var deckId = req.query.deckId
    var userId = req.query.userId
    
    if(!deckId && !userId) {
        Card.find(function(err, cards) {
            res.json(new Response(cards))
        })
    } else if(deckId) {
        // Deck.findById(deckId, function(err, deck) {
        //     var cardIdSet = new Set()
        // })
    } else if(userId) {
        
    }
}