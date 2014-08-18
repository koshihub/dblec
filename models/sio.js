var socketio = require('socket.io');
var dateformat = require('dateformat');
var mongoose = require('mongoose');

module.exports = sio;

function sio(server) {

  // Socket.IO
  var sio = socketio.listen(server);
  //sio.set('transports', [ 'websocket' ]);
  sio.set('transports', [ 'websocket' ]);
  
  // 接続
  sio.sockets.on('connection', function(socket) {

    console.log("connect");

    socket.on("tag", function(query, fn) {
      var Tag;

      if(query.type == "date") {
        Tag = mongoose.model("TagDate");
      }
      else if(query.type == "first") {
        Tag = mongoose.model("TagFirst");
      }
      else if(query.type == "second") {
        Tag = mongoose.model("TagSecond");
      }
      else if(query.type == "match") {
        Tag = mongoose.model("TagMatch");
      }
      else if(query.type == "start") {
        Tag = mongoose.model("TagStart");
      }

      var arr = [];
      var maxcount;

      Tag.find({}, 'tag', { sort: {tag: -1}, skip: query.skip, limit: 15 }, function(err, docs) {
        for (var i = 0; i < docs.length; i++) {
          arr.push(docs[i].tag);
        }

        Tag.count({}, function(err, cnt) {
          maxcount = cnt;
          fn({list: arr, maxcount: maxcount});
        });
      });
    });

    socket.on("search", function(query, fn) {
      var q;

      if (query.type == "date") {
        q = {date: query.tag};
      }
      if (query.type == "first") {
        q = {first: query.tag};
      }
      if (query.type == "second") {
        q = {second: query.tag};
      }
      if (query.type == "match") {
        q = {match: query.tag};
      }


      var arr = [];
      var maxcount;

      var Kifu = mongoose.model('Kifu');
      Kifu.find(q, null, { skip: query.skip, limit: 15}, function(err, docs) {
        arr = docs;

        Kifu.count(q, function(err, cnt) {
          maxcount = cnt;
          fn({list: arr, maxcount: maxcount});
        });
      });
    })

    socket.on("disconnect", function() {
    });
  });
}