var express = require('express')
var router = express.Router()

var controller = require('../../controllers/decks')
var authController = require('../../controllers/authenticate')

router.get('/', controller.get)

router.post('/', 
    authController.isAuthenticated,
    controller.convertCardLists,
    controller.isDeckNameValid,
    controller.isDeckNameFree,
    controller.post
)

router.put('/', 
    authController.isAuthenticated,
    controller.convertCardLists,
    controller.isDeckNameValid,
    controller.isDeckNameFree,
    controller.getDeckForModification,
    controller.put
)

router.delete('/', 
    authController.isAuthenticated,
    controller.getDeckForModification,
    controller.delete
)

module.exports = router