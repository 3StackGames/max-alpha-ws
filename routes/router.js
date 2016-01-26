var express = require('express')
var router = express.Router()

var v1 = require('./v1/router')

/* API Welcome */
router.get('/', function(req, res, next) {
  res.json({
      message: 'Make sure to select an api version. For example: /v1'
  });
});

router.use('/v1', v1)

module.exports = router;