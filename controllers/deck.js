var mod = module.exports = {}

var mongoose = require('mongoose')

var Response = require('../models/response')
var Error = require('../models/error')
var Deck = require('../models/deck')

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

mod.get = function (req, res) {
    var deckId = req.query.deckId
    var ownerId = req.query.userId
    var name = req.query.name
    getDecks(deckId, ownerId, name, function(err, decks) {
        if (err) throw err
        var processedDecks = decks.map(function(deck) {
            return deck.process()
        })
        res.json(new Response(processedDecks))
    })
}

function getDecks(deckId, ownerId, name, cb) {
    var query = {}
    if(deckId) query._id = deckId
    if(ownerId) query.owner = ownerId
    if(name) query.name = name
    Deck.find(query, function(err, decks) {
        cb(null, decks)
    })
}

mod.post = function (req, res) {
    var owner = new mongoose.Types.ObjectId(req.userId)
    
    var name = req.body.name
    var mainCardIds = req.body.mainCards
    var structureIds = req.body.structures
    
    if(!name || !mainCardIds || !structureIds) {
        res.status(400).json(MISSING_PROPERTIES_RESPONSE)
        return
    }
    
    if(!isValidName(name)) {
        res.status(400).json(NAME_LENGTH_RESPONSE)
        return
    }
    
    if(!Array.isArray(mainCardIds) || !Array.isArray(structureIds)) {
        res.status(400).json(CARD_LISTS_NOT_ARRAYS_RESPONSE)
        return
    }
    
    var mainCards = mainCardIds.map(function(mainCardId) {
        return new mongoose.Types.ObjectId(mainCardId)
    })
    
    var structures = structureIds.map(function(structureId) {
        return new mongoose.Types.ObjectId(structureId)
    })
    
    getDecks(null, owner, name, function(err, conflictingDecks) {
        if(conflictingDecks.length > 0) {
            res.status(400).json(NAME_TAKEN_RESPONSE)
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
    })
}

mod.put = function (req, res) {
   var owner = new mongoose.Types.ObjectId(req.userId)
   var deckId = req.body.id
   var name = req.body.name
   var mainCardIds = req.body.mainCards
   var structureIds = req.body.structures
   
   if(!name && !mainCardIds && !structureIds) {
       res.status(400).json(NO_CHANGES_RESPONSE)
       return
   }
   
   if(name && !isValidName(name)) {
        res.status(400).json(NAME_LENGTH_RESPONSE)
        return
    }

    if((mainCardIds && !Array.isArray(mainCardIds)) || (structureIds && !Array.isArray(structureIds))) {
        res.status(400).json(CARD_LISTS_NOT_ARRAYS_RESPONSE)
        return
    }
    
    var mainCards = null
    if(mainCardIds) mainCards = mainCardIds.map(function(mainCardId) {
        return new mongoose.Types.ObjectId(mainCardId)
    })
    
    var structures = null
    if(structureIds) structures = structureIds.map(function(structureId) {
        return new mongoose.Types.ObjectId(structureId)
    })
    
    Deck.findById(deckId, function(err, deck) {
        if(err) throw err
        
        if(!deck) {
            res.status(400).json(DECK_NOT_FOUND_RESPONSE)
            return
        }
        
        if(deck.owner != req.userId) {
            res.status(403).json(NOT_DECK_OWNER_RESPONSE)
            return
        }
        
        if(mainCards) deck.mainCards = mainCards
        if(structures) deck.structures = structures
        if(name) {
            getDecks(null, owner, name, function(err, conflictingDecks) {
                if (err) throw err
                if(conflictingDecks.length > 1) {
                    //greater than 1, because this one's name will conflict
                    res.status(400).json(NAME_TAKEN_RESPONSE)
                    return
                }
                deck.name = name
                
                deck.save(function(err, deck) {
                    if (err) throw err
                    res.json(new Response(deck.process()))
                })
            })
        } else {
            deck.save(function(err, deck) {
                if (err) throw err
                res.json(new Response(deck.process()))
            })
        }
    })
}

mod.delete = function (req, res) {
    
}

function isValidName(name) {
    return name && name.length >= Deck.NAME_LENGTH.min && name.length <= Deck.NAME_LENGTH.max
}