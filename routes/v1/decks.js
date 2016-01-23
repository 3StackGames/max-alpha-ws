var express = require('express')
var router = express.Router()

var controller = require('../../controllers/decks')
var authController = require('../../controllers/authenticate')

router.get('/', controller.get)

router.post('/', authController.isAuthenticated, controller.post)

router.put('/', authController.isAuthenticated, controller.put)

router.delete('/', authController.isAuthenticated, controller.delete)

module.exports = router