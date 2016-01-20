var express = require('express')
var router = express.Router()

var controller = require('../../controllers/user')
var authController = require('../../controllers/authenticate')

/* API Welcome */
router.post('/create', controller.isUsernameTaken)
router.post('/create', controller.create)

// router.get('/show', authController.isAuthenticated)
// router.get('/show', controller.show)
router.get('/show', authController.isAuthenticated, controller.show)


module.exports = router