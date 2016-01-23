var express = require('express');
var router = express.Router();

var user = require('./user')
var deck = require('./deck')
var authenticate = require('./authenticate')
/* API Welcome */
router.get('/', function(req, res, next) {
  res.json({
      message: 'Welcome to the Maximum Alpha API v1'
  });
});

router.use('/authenticate', authenticate)
router.use('/users', user)
router.use('/decks', deck)

module.exports = router;