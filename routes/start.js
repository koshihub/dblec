var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('show', { 
		title: '出だし検索',
		type: "start"
	});
});

module.exports = router;
