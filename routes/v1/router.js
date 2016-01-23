var express = require('express');
var router = express.Router();

var users = require('./users')
var decks = require('./decks')
var cards = require('./cards')
var authenticate = require('./authenticate')
/* API Welcome */
router.get('/', function(req, res, next) {
  res.json({
      message: 'Welcome to the Maximum Alpha API v1'
  });
});

router.use('/authenticate', authenticate)
router.use('/users', users)
router.use('/decks', decks)
router.use('/cards', cards)

module.exports = router;