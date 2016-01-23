var express = require('express')
var router = express.Router()

var controller = require('../../controllers/users')
var authController = require('../../controllers/authenticate')

router.get('/', controller.get)

router.post('/', 
    controller.processUsernameAndPassword,
    controller.isUsernameTaken,
    controller.post
)

router.put('/', 
    authController.isAuthenticated,
    controller.processUsernameAndPassword,
    controller.isUsernameTaken,
    controller.getUserForModification,
    controller.put
)

router.delete('/', 
    authController.isAuthenticated,
    controller.getUserForModification,
    controller.delete
)

module.exports = router