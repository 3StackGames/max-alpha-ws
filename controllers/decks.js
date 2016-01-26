var mod = module.exports = {}

var mongoose = require('mongoose')

var Response = require('../models/response')
var Error = require('../models/error')
var Deck = require('../models/deck')
var User = require('../models/user')

var INVALID_PROPERTIES = 'Invalid Properties'

var MISSING_PROPERTIES_ERROR = new Error(INVALID_PROPERTIES, 'Missing either name, mainCards, or structures')
var MISSING_PROPERTIES_RESPONSE = new Response(null, MISSING_PROPERTIES_ERROR)

var NAME_LENGTH_ERROR = new Error(INVALID_PROPERTIES, 'Name is either too long or too short')
var NAME_LENGTH_RESPONSE = new Response(null, NAME_LENGTH_ERROR)

var CARD_LISTS_NOT_ARRAYS_ERROR = new Error(INVALID_PROPERTIES, 'mainCards and/or structures aren\'t arrays')
var CARD_LISTS_NOT_ARRAYS_RESPONSE = new Response(null, CARD_LISTS_NOT_ARRAYS_ERROR)

var NAME_TAKEN_ERROR = new Error(INVALID_PROPERTIES, 'Deck name already used')
var NAME_TAKEN_RESPONSE = new Response(null, NAME_TAKEN_ERROR)

var NOT_DECK_OWNER_ERROR = new Error('Not Owner', 'Deck doesn\'t belong to the user')
var NOT_DECK_OWNER_RESPONSE = new Response(null, NOT_DECK_OWNER_ERROR)

var NO_CHANGES_ERROR = new Error('No Changes Submitted')
var NO_CHANGES_RESPONSE = new Response(null, NO_CHANGES_ERROR)

var DECK_NOT_FOUND_ERROR = new Error(INVALID_PROPERTIES, 'Deck not found')
var DECK_NOT_FOUND_RESPONSE = new Response(null, DECK_NOT_FOUND_ERROR)

var USER_DOESNT_OWN_CARDS_ERROR = new Error(INVALID_PROPERTIES, 'User doesn\'t own all the cards in the deck')
var USER_DOESNT_OWN_CARDS_RESPONSE = new Response(null, USER_DOESNT_OWN_CARDS_ERROR)

mod.get = function (req, res) {
    var deckId = req.query.deckId
    var ownerId = req.query.userId
    var name = req.query.name
    
    var query = {}
    if(deckId) query._id = deckId
    if(ownerId) query.owner = ownerId
    if(name) query.name = name
    Deck.find(query, function(err, decks) {
        if (err) throw err
        var processedDecks = decks.map(function(deck) {
            return deck.process()
        })
        res.json(new Response(processedDecks))
    })
}

mod.post = function (req, res) {
    var owner = req.userId
    var name = req.body.name
    var mainCards = req.mainCards
    var structures = req.structures
    
    if(!name || !mainCards || !structures) {
        res.status(400).json(MISSING_PROPERTIES_RESPONSE)
        return
    }
    
    var deck = new Deck({
        name: name,
        owner: owner,
        mainCards: mainCards,
        structures: structures
    })
    
    deck.save(function(err, deck) {
        if (err) throw err
        res.status(201).json(new Response(deck.process()))
    })
}

mod.put = function (req, res) {
   var deck = req.deck
   var name = req.body.name
   var mainCards = req.mainCards
   var structures = req.structures
   
   if(!name && !mainCards && !structures) {
       res.status(400).json(NO_CHANGES_RESPONSE)
       return
   }
    
    if(mainCards) deck.mainCards = mainCards
    if(structures) deck.structures = structures
    if(name) deck.name = name
    
    deck.save(function(err, deck) {
        if (err) throw err
        res.json(new Response(deck.process()))
    })
}

mod.delete = function (req, res) {
    var deck = req.deck
    
    deck.remove(function(err) {
        if (err) throw err
        res.status(204).send()
    })
}

/**
 * VALIDATION METHODS
 */

mod.convertCardLists = function (req, res, next) {
    var mainCardIds = req.body.mainCards
    var structureIds = req.body.structures
    
    if((mainCardIds && !Array.isArray(mainCardIds)) || (structureIds && !Array.isArray(structureIds))) {
        res.status(400).json(CARD_LISTS_NOT_ARRAYS_RESPONSE)
    } else {
        if(mainCardIds) req.mainCards = mainCardIds.map(function(mainCardId) {
            return new mongoose.Types.ObjectId(mainCardId)
        })
        
        if(structureIds) req.structures = structureIds.map(function(structureId) {
            return new mongoose.Types.ObjectId(structureId)
        })
        next()
    }
}

mod.isDeckNameFree = function (req, res, next) {
    var name = req.body.name
    if(!name) {
        next()
        return
    }
    var userId = req.userId
    Deck.find( { owner: userId, name: name }, function(err, conflictingDecks) {
        if(conflictingDecks.length > 0) {
            res.status(400).json(NAME_TAKEN_RESPONSE)
            return
        }
        next()
    })
}

mod.isDeckNameValid = function (req, res, next) {
    var name = req.body.name
    if(name) {
        if(name.length >= Deck.NAME_LENGTH.min && name.length <= Deck.NAME_LENGTH.max) {
            next()
        } else {
            res.status(400).json(NAME_LENGTH_RESPONSE)
            return
        }
    } else {
        next()
    } 
}

mod.getDeckForModification = function(req, res, next) {
    var deckId = req.body.id
    var userId = req.userId
    Deck.findById(deckId, function(err, deck) {
        if(err) throw err
        
        if(!deck) {
            res.status(400).json(DECK_NOT_FOUND_RESPONSE)
            return
        }
        
        if(!deck.owner.equals(userId)) {
            res.status(403).json(NOT_DECK_OWNER_RESPONSE)
            return
        }
        req.deck = deck
        next()
    })
}

mod.userOwnsCards = function (req, res, next) {
    var userId = req.userId
    var mainCards = req.mainCards
    var structures = req.structures
    
    User.findById(userId, function (err, user) {
        function userOwnsCard(card) {
            return user.cards.indexOf(card) >= 0
        }
        if(structures && !mainCards.every(userOwnsCard)) {
            res.json(USER_DOESNT_OWN_CARDS_RESPONSE)
            return
        }
        if(structures && !structures.every(userOwnsCard)) {
            res.json(USER_DOESNT_OWN_CARDS_RESPONSE)
            return
        }
        next()
    })
}