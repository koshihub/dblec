var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('show', { 
		title: '先手番検索',
		type: "first"
	});
});

module.exports = router;
