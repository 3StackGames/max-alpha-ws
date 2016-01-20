var express = require('express');
var router = express.Router();

var controller = require('../../controllers/authenticate')

/* API Welcome */
router.post('/login', controller.login)



module.exports = router;