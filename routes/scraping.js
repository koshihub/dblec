var express = require('express');
var client = require('cheerio-httpcli');
var router = express.Router();
var mongoose = require('mongoose');

/**
 * GET
 *
 * This action is used to scrape Kifu data from the original database (http://wiki.optus.nu/shogi/)
 */

router.get('/', function(req, res) {
	var moveTree = new Object();

	var url = "http://wiki.optus.nu/shogi/index.php?cmd=kif&cmds=displaytxt&kid=";

	var from = 1, to = 10;
	var _acc = function(kid) {
		(function(_kid) {
			client.fetch(url + "" + kid, {}, function (err, $, res) {
				/*
				 * Insert data into database
				 */
				var _insert = function(data) {
					var _s = function(str, terminal) {
						var begin = data.indexOf(str, 0) + str.length;
						var end = data.indexOf(terminal, begin);
						return data.substring(begin, end);
					};

					var Kifu = mongoose.model('Kifu');
					var kifu = new Kifu();

					kifu.date = _s("開始日時：", "\r");
					kifu.match = _s("棋戦：", "\r");
					kifu.second = _s("後手：", "\r");
					kifu.first = _s("先手：", "\r");
					kifu.data = data;

					kifu.moves = [];
					for (var i = 1; i < 10; i++) {
						kifu.moves.push(_s("  " + i + " ", " "));
					};

					kifu.save(function(err) {
						console.log("SAVE OK!" + _kid);

						// date
						var TagDate = mongoose.model('TagDate');
						var tagdate = new TagDate();
						tagdate.tag = kifu.date;
						tagdate.save();

						// match
						var TagMatch = mongoose.model('TagMatch');
						var tagmatch = new TagMatch();
						tagmatch.tag = kifu.match;
						tagmatch.save();

						// first
						var TagFirst = mongoose.model('TagFirst');
						var tagfirst = new TagFirst();
						tagfirst.tag = kifu.first;
						tagfirst.save();

						// second
						var TagSecond = mongoose.model('TagSecond');
						var tagsecond = new TagSecond();
						tagsecond.tag = kifu.second;
						tagsecond.save();

						// moves
						var TagMoves = mongoose.model('TagMoves');
						var tagmoves = new TagMoves();
						tagmoves.tag = kifu.moves;
						tagmoves.save();

						// start
						var TagStart = mongoose.model('TagStart');
						var tagstart = new TagStart();
						tagstart.tag = kifu.moves[0];
						tagstart.save();

						if (err) { console.log(err); }
					});
				};

				$('textarea').each(function() {
					_insert($(this).text());
				});
			});
		})(kid);

		if (kid <= to) {
			setTimeout(_acc(kid+1), 100);
		}
	};

	_acc(from);
	
	res.render('index', { title: 'Express' });
});


module.exports = router;
