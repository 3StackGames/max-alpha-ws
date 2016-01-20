var express = require('express')
var router = express.Router()

var v1 = require('./v1/router')

/* API Documentation */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
});

/* API Welcome */
router.get('/api', function(req, res, next) {
  res.json({
      message: 'Make sure to select an api version. For example: /api/v1'
  });
});

router.use('/api/v1', v1)

module.exports = router;