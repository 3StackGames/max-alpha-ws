var express = require('express')
var router = express.Router()

var controller = require('../../controllers/user')
var authController = require('../../controllers/authenticate')

/* API Welcome */
router.post('/', controller.isUsernameTaken)
router.post('/', controller.post)

// router.get('/show', authController.isAuthenticated, controller.show)
router.get('/', controller.get)

module.exports = router