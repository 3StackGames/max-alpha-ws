var express = require('express')
var router = express.Router()

var controller = require('../../controllers/cards')

router.get('/', controller.get)

module.exports = router