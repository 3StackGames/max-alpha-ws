var express = require('express')
var router = express.Router()

var controller = require('../../controllers/decks')
var authController = require('../../controllers/authenticate')

router.get('/', controller.get)

router.post('/', authController.isAuthenticated)
router.post('/', controller.convertCardLists)
router.post('/', controller.isDeckNameValid)
router.post('/', controller.isDeckNameFree)
router.post('/', controller.post)

router.put('/', authController.isAuthenticated)
router.put('/', controller.convertCardLists)
router.put('/', controller.isDeckNameValid)
router.put('/', controller.isDeckNameFree)
router.put('/', controller.getDeckForModification)
router.put('/', controller.put)

router.delete('/', authController.isAuthenticated)
router.delete('/', controller.getDeckForModification)
router.delete('/', controller.delete)

module.exports = router