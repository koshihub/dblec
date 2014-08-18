
var pageLimit = 15;

// socket.io接続
var socket = io.connect();

// 接続時
socket.on('connect', function() {
	console.log("connect");
});

$(document).ready(function() {
	getTags(0);
});

var isPager1Initialized = false;
var isPager2Initialized = false;
var currentTag;

function getTags(skip) {
	$("#left-box .loader").css("display", "inherit");
	socket.emit("tag", {type: type, skip: skip}, function(res) {
		$("#tag-list").css({display: "none"});
		$("#tag-list").empty();
		for (var i = 0; i < res.list.length; i++) {
			var elm = $("<p>").append($("<a>").text(res.list[i]).click(
				{t: res.list[i]},
				function(e) {
					currentTag = e.data.t;
					isPager2Initialized = false;
					$("pager2").empty();
					searchKifu(0);
				}));
			$("#tag-list").append(elm);
		};
		$("#tag-list").animate({ opacity: 'show' }, 'fast');
		$("#left-box .loader").css("display", "none");

		if(!isPager1Initialized) {
			$("#pager1").pagination({
				items: res.maxcount / pageLimit,
				displayedPages: 3,
				edges: 1,
				cssStyle: "compact-theme",
				prevText: "<",
				nextText: ">",
				onPageClick: function(num) {
					getTags((num-1) * pageLimit);
				}
			});
			isPager1Initialized = true;
		}
	});
}

function searchKifu(skip) {
	$("#center-box .loader").css("display", "inherit");
	socket.emit("search", {type: type, tag: currentTag, skip: skip}, function(res) {
		setList(res.list);
		$("#center-box .loader").css("display", "none");

		if(!isPager2Initialized) {
			$("#pager2").pagination({
				items: res.maxcount / pageLimit,
				displayedPages: 3,
				edges: 1,
				cssStyle: "compact-theme",
				prevText: "<",
				nextText: ">",
				onPageClick: function(num) {
					searchKifu((num-1) * pageLimit);
				}
			});
			isPager2Initialized = true;
		}
	});
}

function setList(data) {
	var _title = function(data) {
		return data.date + " - " + data.match + " - " + data.first + " 対 " + data.second;
	};

	$("#kifu-list").css({display: "none"});
	$("#kifu-list").empty();
	for (var i = 0; i < data.length; i++) {
		var elm = $("<p>").append($("<a>").text(_title(data[i])).click(
			{k: data[i]},
			function(e) {
				showKifu(e.data.k);
			}));
		$("#kifu-list").append(elm);
	};
	$("#kifu-list").animate({ opacity: 'show' }, 'fast');
}

function showKifu(k) {
	var kifu = Kifu(k.data, "kif");
	$('#board').empty();
	$("#board").css({display: "none"});
	$('#board').shogiBoard(kifu);
	$("#board").animate({ opacity: 'show' }, 'fast');
}