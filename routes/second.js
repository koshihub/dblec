var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('show', { 
		title: '後手番検索',
		list: arr,
		type: "second"
	});
});

module.exports = router;
