var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('show', { 
		title: '日付検索',
		type: "date"
	});
});

module.exports = router;
