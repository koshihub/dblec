var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'DB lec 将棋棋譜データベース' });
});

module.exports = router;
