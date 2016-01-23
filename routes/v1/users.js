var express = require('express')
var router = express.Router()

var controller = require('../../controllers/users')
var authController = require('../../controllers/authenticate')

router.get('/', controller.get)

router.post('/', controller.isUsernameTaken)
router.post('/', controller.post)

router.put('/', controller.isUsernameTaken)
router.put('/', authController.isAuthenticated, controller.put)

router.delete('/', authController.isAuthenticated, controller.delete)

module.exports = router