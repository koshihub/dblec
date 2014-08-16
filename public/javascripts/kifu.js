/*
 * core.js
 *
 * Copyright 2011, Masato Bito
 * Licensed under the MIT license.
 *
 */
(function(window) {


var _Kifu = window.Kifu;

var board_piece_map = {
  '歩': 'FU',
  '香': 'KY',
  '桂': 'KE',
  '銀': 'GI',
  '金': 'KI',
  '角': 'KA',
  '飛': 'HI',
  '王': 'OU',
  '玉': 'OU',
  'と': 'TO',
  '杏': 'NY',
  '圭': 'NK',
  '全': 'NG',
  '馬': 'UM',
  '龍': 'RY',
  '竜': 'RY'
};

var direction_map = {
  左: 'left',
  右: 'right',
  直: 'straight_up'
};

var kanji_number_map = {
  '一':   1,
  '二':   2,
  '三':   3,
  '四':   4,
  '五':   5,
  '六':   6,
  '七':   7,
  '八':   8,
  '九':   9,
  '十':  10
};

var move_piece_map = {
  '歩':   'FU',
  '香':   'KY',
  '桂':   'KE',
  '銀':   'GI',
  '金':   'KI',
  '角':   'KA',
  '飛':   'HI',
  '王':   'OU',
  '玉':   'OU',
  'と':   'TO',
  '成香': 'NY',
  '成桂': 'NK',
  '成銀': 'NG',
  '馬':   'UM',
  '龍':   'RY',
  '竜':   'RY'
};

var movement_map = {
  上: 'up',
  寄: 'horizon',
  引: 'down',
  下: 'down',  // optional
  行: 'up',    // optional
  入: 'up'     // optional
};

var zenkaku_number_map = {
  '０': 0,
  '１': 1,
  '２': 2,
  '３': 3,
  '４': 4,
  '５': 5,
  '６': 6,
  '７': 7,
  '８': 8,
  '９': 9
};

/*
 * Kifu object
 */
var Kifu = (function(source, format) {
  return new Kifu.initialize(source, format);
});

Kifu.extend = Kifu.prototype.extend = function(source) {
  for (var property in source) {
    this[property] = source[property];
  }
  return this;
};

Kifu.prototype.extend({
  hasNext: function() {
    var move = this.moves.get(this.step+1);
    if (move && move.type == 'move') {
      return true;
    }
    return false;
  },

  hasPrev: function() {
    if (this.step > 0) {
      var move = this.moves.get(this.step-1);
      if (move && move.type == 'move') {
        return true;
      }
    }
    return false;
  },

  moveCurrent: function() {
    var move = this.moves.get(this.step);
    if (move && move.type == 'move') return move;
    return null;
  },

  moveFirst: function() {
    this.is_black = this.info.player_start == 'black';
    this.step     = 0;
    this.suite    = this.suite_init.clone();
    return this;
  },

  moveLast: function() {
    do {
      var step = this.step;
      this.moveNext();
    } while(step != this.step);
  },

  moveNext: function() {
    var move = this.moves.get(this.step+1);
    if (move && move.type == 'move') {
      this.suite.move(move);
      this.is_black = !move.is_black;
      this.step++;
    }
    return move;
  },

  movePrev: function() {
    var move = this.moves.get(this.step);
    if (move && move.type == 'move') {
      this.suite.moveReverse(move);
      this.is_black = move.is_black;
      this.step--
    }
    return move;
  },

  moveStrings: function() {
    var result       = [];
    var move_records = this.moves.records;
    for (var i in move_records) {
      var move = move_records[i];
      if (move.str) {
        result.push(move.str);
      }
    }
    return result;
  },

  moveTo: function(step) {
    this.moveFirst();
    while (step != this.step) {
      this.moveNext();
    }
  },

  output: function(format)
  {
    var klass  = Kifu.capitalize(format);
    var parser = Kifu[klass](this);
    return parser.output();
  },

  parse: function(format) {
    if (format) {
      this.info.format = format;
    }

    var klass = Kifu.capitalize(this.info.format);
    this.parser = Kifu[klass](this);
    this.parser.parse();
    Kifu.Prepare(this);

    this.moveFirst();
    return this;
  },

  source: function(source) {
    if (source) {
      this.info.source = Kifu.load(source);
    }
    return this.info.source;
  }
});

Kifu.extend({
  initialize: function(source, format) {
    this.suite_init = Kifu.Suite();
    this.info       = {};
    this.moves      = Kifu.Move();

    if (source) {
      this.source(source);
    }

    if (format) {
      this.parse(format);
    }
  },

  ajax: function(options, format, func_obj) {
    options.dataType = 'text';
    options.type     = 'GET';
    options.success  = function(source) {
      return func_obj(Kifu(source, format));
    };
    return jQuery.ajax(options);
  },

  ajaxLoad: function(url, format, func_obj) {
    return Kifu.ajax({url: url}, format, func_obj);
  },

  boardPieceToPiece: function(kanji) {
    return board_piece_map[kanji];
  },

  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  },

  clone: function(source) {
    if (source instanceof Array) {
      var result = [];
    } else {
      var result = {};
    }

    for (var property in source) {
      var value = source[property];
      if (value === null) {
        result[property] = value;
      } else if (typeof value == 'object') {
        result[property] = Kifu.clone(value);
      } else {
        result[property] = value;
      }
    }

    return result;
  },

  directionToKanji: function(direction) {
    for (var name in direction_map) {
      if (direction_map[name] == direction) {
        return name;
      }
    }
  },

  integerToKanji: function(num) {
    var str = '';

    if (10 <= num) {
      str += '十';
    }

    num = num % 10;
    for (var name in kanji_number_map) {
      if (kanji_number_map[name] == num) {
        str += name;
        break;
      }
    }

    return str;
  },

  integerToZenkaku: function(num) {
    for (var name in zenkaku_number_map) {
      if (zenkaku_number_map[name] == num) {
        return name;
      }
    }
  },

  kanjiToDirection: function(kanji) {
    return direction_map[kanji];
  },

  kanjiToMovement: function(kanji) {
    return movement_map[kanji];
  },

  kanjiToInteger: function(kanji) {
    var num = 0;
    var l   = kanji.length;
    for (var i = 0; i < l; i++) {
      num += kanji_number_map[kanji.substr(i, 1)];
    }
    return num;
  },

  load: function(source) {
    var element = document.getElementById(source);
    if (element) {
      return element.innerHTML;
    } else {
      return source;
    }
  },

  movementToKanji: function(movement) {
    for (var name in movement_map) {
      if (movement_map[name] == movement) {
        return name;
      }
    }
  },

  movePieceToPiece: function(kanji) {
    return move_piece_map[kanji];
  },

  noConflict: function() {
    window.Kifu = _Kifu;
    return Kifu;
  },

  pieceToBoardPiece: function(piece) {
    for (var name in board_piece_map) {
      if (board_piece_map[name] == piece) {
        return name;
      }
    }
  },

  pieceToMovePiece: function(piece) {
    for (var name in move_piece_map) {
      if (move_piece_map[name] == piece) {
        return name;
      }
    }
  },

  zenkakuToInteger: function(zenkaku) {
    return zenkaku_number_map[zenkaku];
  }
});


Kifu.initialize.prototype = Kifu.prototype;
window.Kifu = Kifu;
})(window);


// Local variables:
// indent-tabs-mode: nil
// js2-basic-offset: 2
// end:
// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
/*
 * csa.js
 *
 * Copyright 2011, Masato Bito
 * Licensed under the MIT license.
 *
 */
(function(Kifu) {
Kifu.Csa = (function(kifu) { return new Kifu.Csa.initialize(kifu); });
Kifu.Csa.extend = Kifu.Csa.prototype.extend = Kifu.extend;


Kifu.Csa.prototype.extend({
  output: function() {
    var kifu = this.kifu;
    if (kifu.info.format == 'csa') {
      return kifu.info.source;
    }

    var result = "' --- generated by jsShogiKifu ---\n";
    result += "V2.2\n";
    result += this.outputInfo(kifu.info);
    result += this.outputSuite(kifu.suite_init, kifu.info);
    result += this.outputMoves(kifu.moves);
    return result;
  },

  outputBoard: function(board) {
    var result = '';

    for (var y = 1; y <= 9; y++) {
      result += 'P' + y;
      for (var x = 9; 1 <= x; x--) {
        var cell = board[x][y];
        if (cell) {
          result += (cell.is_black ? '+' : '-') + cell.piece;
        } else {
          result += ' * ';
        }
      }
      result += "\n";
    }

    return result;
  },

  outputDate: function(date) {
    var yy = date.getFullYear();
    var mm = date.getMonth() + 1;
    if (mm < 10) {
      mm = '0' + mm;
    }
    var dd = date.getDate();
    if (dd < 10) {
      dd = '0' + dd;
    }
    var h  = date.getHours();
    if (h < 10) {
      h = '0' + h;
    }
    var m  = date.getMinutes();
    if (m < 10) {
      m = '0' + m;
    }
    var s  = date.getSeconds();
    if (s < 10) {
      s = '0' + s;
    }
    return yy + '/' + mm + '/' + dd + ' ' + h + ':' + m + ':' + s;
  },

  outputInfo: function(info) {
    var result = '';

    for (var key in info) {
      var value = info[key];
      switch (key) {
      case 'event':
      case 'opening':
      case 'site':
        result += '$' + key.toUpperCase() + ':' + value + "\n";
        break;

      case 'end_time':
      case 'start_time':
        result += '$' + key.toUpperCase() + ':' + this.outputDate(value) + "\n";
        break;

      case 'player_black':
      case 'player_white':
        var player = key == 'player_black' ? '+' : '-';
        result += 'N' + player + value + "\n";
        break;

      case 'time_limit':
        result += '$TIME_LIMIT:';
        var h = value.allotted / 60;
        if (h < 10) {
          result += '0';
        }
        result += h + ':';
        var m = value.allotted % 60;
        if (m < 10) {
          result += '0';
        }
        result += m + '+';
        var s = value.extra || 0;
        if (s < 10) {
          result += '0';
        }
        result += s + "\n";
        break;

      default:
        break;
      }
    }

    return result;
  },

  outputMoves: function(moves) {
    var result = '';

    var records = moves.records;
    var l       = records.length;
    for (var i = 0; i < l; i++) {
      var record = records[i];

      switch (record.type) {
      case 'move':
        var from   = record.from;
        var to     = record.to;
        var player = record.is_black ? '+' : '-';
        result += player + from.x + from.y + to.x + to.y + to.piece + "\n";
        if (record.period) {
          result += 'T' + record.period + "\n";
        }
        break;

      case 'init':
        break;

      default:
        result += '%' + record.type.toUpperCase() + "\n";
        break;
      }

      if (record.comment) {
        var lines = this.toLines(record.comment);
        var m     = lines.length;
        for (var j = 0; j < m; j++) {
          result += "'*" + lines[j] + "\n";
        }
      }
    }

    return result;
  },

  outputStand: function(stand, is_black) {
    var result = '';

    for (var piece in stand) {
      var amount = stand[piece];
      for (var i = 0; i < amount; i++) {
        result += '00' + piece;
      }
    }

    if (result) {
      return 'P' + (is_black ? '+' : '-') + result + "\n";
    } else {
      return '';
    }
  },

  outputSuite: function(suite, info) {
    var result = '';
    result += this.outputBoard(suite.board);
    result += this.outputStand(suite.stand.black, true);
    result += this.outputStand(suite.stand.white, false);
    result += (info.player_start == 'black' ? '+' : '-') + "\n";
    return result;
  },

  parse: function() {
    var lines = this.toLines(this.kifu.info.source);
    var l = lines.length;
    for (var i = 0; i < l; i++) {
      var line = lines[i];
      this.parseByLine(line);
    }

    return this;
  },

  parseByLine: function(line) {
    var kifu = this.kifu;

    if (line == '+') {
      kifu.info.player_start = 'black';
      return true;
    } else if (line == '-') {
      kifu.info.player_start = 'white';
      return true;
    } else if (line.substr(0, 2) == "'*") {
      kifu.moves.addComment(line.substr(2));
      return true;
    }

    switch (line.charAt(0)) {
    case '$':
      var pos   = line.indexOf(':');
      var key   = line.substr(1, pos-1).toLowerCase();
      var value = line.substr(pos+1);

      switch (key) {
      case 'end_time':
      case 'start_time':
        var date = new Date();
        date.setTime(Date.parse(value));
        value = date;
        break;

      case 'time_limit':
        var hours   = parseInt(value.substr(0, 2));
        var minutes = parseInt(value.substr(3, 2));
        var extra   = parseInt(value.substr(6));
        value = {
          allotted: hours * 60 + minutes,
          extra: extra};
        break;
      }

      kifu.info[key] = value;
      return true;

    case '%':
      var value   = line.substr(1);
      var options = {};

      switch (value.charAt(0)) {
      case '+':
      case '-':
        options.is_black = value.charAt(0) == '+' ? true : false;
        value = value.substr(1);
        break;
      }

      kifu.moves.addSpecial(value, options);
      return true;

    case '+':
    case '-':
      var params = {};
      params.from     = {x: line.charAt(1)-'0', y: line.charAt(2)-'0'};
      params.to       = {x: line.charAt(3)-'0', y: line.charAt(4)-'0'};
      params.to.piece = line.substr(5, 2);
      params.is_black = line.charAt(0) == '+' ? true : false;
      kifu.moves.addMove(params);
      return true;

    case 'N':
      var player = 'player_' + (line.charAt(1) == '+' ? 'black' : 'white');
      kifu.info[player] = line.substr(2);
      return true;

    case 'P':
      switch (line.charAt(1)) {
      case 'I':
        kifu.suite_init.hirate();
        for (var i = 0; ; i++) {
          var p_info = line.substr(2+i*4, 4);
          if (p_info.length < 4) {
            break;
          }
          var x     = p_info.charAt(0) - '0';
          var y     = p_info.charAt(1) - '0';
          var piece = p_info.substr(2);
          kifu.suite_init.cellRemove(x, y, piece);
        }
        return true;

      case '+':
      case '-':
        var is_black = line.charAt(1) == '+';
        for (var i = 0; ; i++) {
          var p_info = line.substr(2+i*4, 4);
          if (p_info.length < 4) {
            break;
          }
          var x     = p_info.charAt(0) - '0';
          var y     = p_info.charAt(1) - '0';
          var piece = p_info.substr(2);
          if (x == 0 && y == 0) {
            kifu.suite_init.standDeploy(piece, is_black);
          } else {
            kifu.suite_init.cellDeploy(x, y, piece, is_black);
          }
        }
        return true;

      default:
        var y = line.charAt(1) - '0';
        if (y < 1 || 9 < y) {
          return false;
        }
        for (var i = 0; i < 9; i++) {
          var p_info = line.substr(2+i*3, 3);
          switch (p_info.charAt(0)) {
          case '+':
            var is_black = true;
            break;
          case '-':
            var is_black = false;
            break;
          default:
            continue;
          }
          var x     = 9 - i;
          var piece = p_info.substr(1, 2);
          kifu.suite_init.cellDeploy(x, y, piece, is_black);
        }
        return true;
      }
      return false;

    case 'T':
      var period = parseInt(line.substr(1));
      kifu.moves.addPeriod(period);
      return true;

    case 'V':
      kifu.info.version = line.substr(1);
      return true;
    }

    return false;
  },

  toLines: function(source) {
    var result = [];
    var lines = source.replace(/,(\r?\n|\r)/g, '').split(/\r?\n|\r/);
    var l = lines.length;
    for (var i = 0; i < l; i++) {
      var line = lines[i];
      if (line) {
        result.push(lines[i]);
      }
    }
    return result;
  }
});

Kifu.Csa.extend({
  initialize: function(kifu) {
    this.kifu = kifu;
  }
});


Kifu.Csa.initialize.prototype = Kifu.Csa.prototype
})(Kifu);

// Local variables:
// indent-tabs-mode: nil
// js2-basic-offset: 2
// end:
// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
/*
 * kif.js
 *
 * Copyright 2011, Masato Bito
 * Licensed under the MIT license.
 *
 */
(function(Kifu) {
Kifu.Kif = (function(kifu) { return new Kifu.Kif.initialize(kifu); });
Kifu.Kif.extend = Kifu.Kif.prototype.extend = Kifu.extend;


var handicap_name_map = {
  '平手':     'even',
  '香落ち':   'lance',
  '右香落ち': 'right_lance',
  '角落ち':   'bishop',
  '飛車落ち': 'rook',
  '飛香落ち': 'rook_and_lance',
  '二枚落ち': 'two_drops',
  '四枚落ち': 'four_drops',
  '六枚落ち': 'six_drops',
  'その他':   'other'
};

var info_map = {
  終了日時: 'end_time',
  棋戦:     'event',
  戦型:     'opening',
  先手:     'player_black',
  下手:     'player_black',
  後手:     'player_white',
  上手:     'player_white',
  場所:     'site',
  開始日時: 'start_time',
  表題:     'title'
};

var promote_map = {
  FU: 'TO',
  KY: 'NY',
  KE: 'NK',
  GI: 'NG',
  KA: 'UM',
  HI: 'RY'
};

Kifu.Kif.prototype.extend({
  handicapToKanji: function(handicap) {
    for (var name in handicap_name_map) {
      if (handicap_name_map[name] == handicap) {
        return name;
      }
    }
  },

  infoToKanji: function(info_key) {
    for (var name in info_map) {
      if (info_map[name] == info_key) {
        return name;
      }
    }
  },

  kanjiToHandicap: function(kanji) {
    return handicap_name_map[kanji];
  },

  kanjiToInfo: function(kanji) {
    return info_map[kanji];
  },

  output: function() {
    var kifu = this.kifu;
    if (kifu.info.format == 'kif') {
      return kifu.info.source;
    }

    var result = "# --- generated by jsShogiKifu ---\n";
    result += this.outputInfo(kifu.info);
    result += this.outputSuite(kifu.suite_init, kifu.info);
    result += this.outputMoves(kifu.moves);
    return result;
  },

  outputBoard: function(board) {
    var result = "  ９ ８ ７ ６ ５ ４ ３ ２ １\n";
    result += "+---------------------------+\n";

    for (var y = 1; y <= 9; y++) {
      result += '|';

      for (var x = 9; 1 <= x; x--) {
        var cell = board[x][y];
        if (cell) {
          result += cell.is_black ? ' ' : 'v';
          result += Kifu.pieceToBoardPiece(cell.piece);
        } else {
          result += ' ・';
        }
      }

      result += '|' + Kifu.integerToKanji(y) + "\n";
    }

    result += "+---------------------------+\n";
    return result;
  },

  outputDate: function(date) {
    var yy = date.getFullYear();
    var mm = date.getMonth() + 1;
    if (mm < 10) {
      mm = '0' + mm;
    }
    var dd = date.getDate();
    if (dd < 10) {
      dd = '0' + dd;
    }
    var h  = date.getHours();
    if (h < 10) {
      h = '0' + h;
    }
    var m  = date.getMinutes();
    if (m < 10) {
      m = '0' + m;
    }
    var s  = date.getSeconds();
    if (s < 10) {
      s = '0' + s;
    }
    return yy + '/' + mm + '/' + dd + ' ' + h + ':' + m + ':' + s;
  },

  outputInfo: function(info) {
    var result = '';

    for (var key in info) {
      var value = info[key];
      switch (key) {
      case 'end_time':
      case 'start_time':
        result += this.infoToKanji(key) + '：' + this.outputDate(value) + "\n";
        break;

      case 'handicap':
        result += '手合割：' + this.handicapToKanji(value) + "\n";
        break;

      case 'kif':
        for (var k in value) {
          result += k + '：' + value[k] + "\n";
        }
        break;

      case 'player_start':
        if (value == 'black') {
          result += "先手番\n";
        } else {
          result += "後手番\n";
        }
        break;

      case 'time_consumed':
        result += '消費時間：' +
          '▲' + value.black +
          '△' + value.white + "\n";
        break;

      case 'time_limit':
        result += '持ち時間：各';
        var h = value.allotted / 60;
        if (h) {
          result += h + '時間';
        }
        var m = value.allotted % 60;
        if (m) {
          result += m + '分';
        }
        result += "\n";
        break;

      default:
        var info_key = this.infoToKanji(key);
        if (info_key) {
          result += info_key + '：' + value + "\n";
        }
        break;
      }
    }

    return result;
  },

  outputMoves: function(moves) {
    var result = "手数----指手---------消費時間--\n";

    var records = moves.records;
    var l       = records.length;
    for (var i = 0; i < l; i++) {
      var record = records[i];

      var num = i + '';
      var m   = 4 - num.length;
      for (j = 0; j < m; j++) {
        num = ' ' + num;
      }

      switch (record.type) {
      case 'move':
        var from    = record.from;
        var to      = record.to;
        var space_l = 7;

        result += num + ' ';

        if (record.is_same_place) {
          result += '同　';
        } else {
          result += Kifu.integerToZenkaku(to.x) + Kifu.integerToKanji(to.y);
        }
        var piece = Kifu.pieceToMovePiece(from.piece);
        result   += piece;
        space_l  -= piece.length * 2;
        if (from.piece != to.piece) {
          result  += '成';
          space_l -= 2;
        }

        if (from.x) {
          result += '(' + from.x + from.y + ')';
          space_l -= 2;
        } else {
          result += '打';
        }

        for (var j = 0; j < space_l; j++) {
          result += ' ';
        }
        result += "( 0:00/00:00:00)\n";
        break;

      case 'TORYO':
        result += num + " 投了         ( 0:00/00:00:00)\n";
        break;

      case 'TSUMI':
        result += num + " 詰み         ( 0:00/00:00:00)\n";
        break;

      default:
        break;
      }

      if (record.comment) {
        var lines = this.toLines(record.comment);
        var m     = lines.length;
        for (var j = 0; j < m; j++) {
          result += '*' + lines[j] + "\n";
        }
      }
    }

    return result;
  },

  outputStand: function(stand) {
    var result = '';

    for (var piece in stand) {
      var amount = stand[piece];
      if (amount < 1) {
        continue;
      }
      result +=
        Kifu.pieceToBoardPiece(piece) + Kifu.kanjiToInteger(amount) + '　';
    }

    if (!result) {
      result += 'なし';
    }

    result += "\n";
    return result;
  },

  outputSuite: function(suite, info) {
    if (info.handicap && info.handicap != 'other') {
      return '';
    }

    var result = '';
    result += '後手の持ち駒：' + this.outputStand(suite.stand.white);
    result += this.outputBoard(suite.board);
    result += '先手の持ち駒：' + this.outputStand(suite.stand.black);
    return result;
  },

  parse: function() {
    var lines = this.toLines(this.kifu.info.source);
    var l = lines.length;
    for (var i = 0; i < l; i++) {
      var line = lines[i];
      this.parseByLine(line);
    }

    this.prepare();

    return this;
  },

  parseByLine: function(line) {
    if (this.parseByLineAsComment(line)) {
      return true;
    }

    if (this.parseByLineAsInfo(line)) {
      return true;
    }

    if (this.parseByLineAsInfo2(line)) {
      return true;
    }

    if (this.parseByLineAsBoard(line)) {
      return true;
    }

    if (this.parseByLineAsMove(line)) {
      return true;
    }

    return false;
  },

  parseByLineAsBoard: function(line) {
    if (!line.match(/^\|.+\|/)) {
      return false;
    }

    this._board_setup = true;

    var line = this.strip(line);
    var y    = Kifu.kanjiToInteger(line.charAt(line.length-1));

    var suite_init = this.kifu.suite_init;
    for (var i = 0; i < 9; i++) {
      var piece = Kifu.boardPieceToPiece(line.substr(i*2+2, 1));
      if (!piece) {
        continue;
      }

      var is_black = !(line.substr(i*2+1, 1) == 'v');
      var x        = 9 - i;
      suite_init.cellDeploy(x, y, piece, is_black);
    }

    return true;
  },

  parseByLineAsComment: function(line) {
    switch (line.charAt(0)) {
    case '#':
      return true;
    case '*':
      // 変化は未実装
      if (this._henka) {
        return true;
      }
      if (line.length > 1) this.kifu.moves.addComment(line.substr(1));
      return true;
    }
    return false;
  },

  parseByLineAsInfo: function(line) {
    if (!line.match(/^(.+?)：(.+)/)) {
      return false;
    }

    var info  = this.kifu.info;
    var key   = RegExp.$1;
    var value = this.strip(RegExp.$2);

    switch (key) {
    case '開始日時':
    case '終了日時':
      var info_key   = this.kanjiToInfo(key);
      info[info_key] = this.toDate(value);
      return true;

    case '持ち時間':
      if (value.match(/([0-9]+)時間/)) {
        info.time_limit || (info.time_limit = {});
        info.time_limit.allotted = parseInt(RegExp.$1) * 60;
      }
      return true;

    case '消費時間':
      if (value.match(/[0-9]+▲([0-9]+)△([0-9]+)/)) {
        info.time_consumed = {
          black: parseInt(RegExp.$1),
          white: parseInt(RegExp.$2)
        };
      }
      return true;

    case '手合割':
      info.handicap = this.kanjiToHandicap(value);
      return true;

    case '先手の持駒':
    case '下手の持駒':
      return this.parseStand(value, true);

    case '後手の持駒':
    case '上手の持駒':
      return this.parseStand(value, false);

    case '変化':
      this._henka = true;
      return true;

    default:
      var info_key = this.kanjiToInfo(key);
      if (info_key) {
        info[info_key] = value;
      } else {
        info.kif || (info.kif = {});
        info.kif[key] = value;
      }
      return true;
    }

    return false;
  },

  parseByLineAsInfo2: function(line) {
    var info = this.kifu.info;

    switch (this.strip(line)) {
    case '先手番':
    case '下手番':
      info.player_start = 'black';
      return true;

    case '上手番':
    case '後手番':
      info.player_start = 'white';
      return true;
    }

    return false;
  },

  parseByLineAsMove: function(line) {
    if (!line.match(/^ *([0-9]+) ([^ ]+)/)) {
      return false;
    }

    // 変化は未実装
    if (this._henka) {
      return true;
    }

    var num    = parseInt(RegExp.$1);
    var move   = RegExp.$2;
    var moves  = this.kifu.moves;

    switch (this.strip(move)) {
    case '投了':
      moves.addSpecial('TORYO');
      return true;

    case '千日手':
      moves.addSpecial('SENNICHITE');
      return true;

    case '持将棋':
      moves.addSpecial('JISHOGI');
      return true;

    case '詰み':
      moves.addSpecial('TSUMI');
      return true;
    }

    var params = {from: {}, to: {}}
    var from   = params.from;
    var to     = params.to;

    if (move.charAt(0) == '同') {
      to.x = to.y = 0;
      params.is_same_place = true;
    } else {
      to.x = Kifu.zenkakuToInteger(move.charAt(0));
      to.y = Kifu.kanjiToInteger(move.charAt(1));
      params.is_same_place = false;
    }
    move = move.substr(2);

    if (move.charAt(0) == '成') {
      from.piece = to.piece = Kifu.movePieceToPiece(move.substr(0, 2));
      move = move.substr(2);
    } else {
      from.piece = to.piece = Kifu.movePieceToPiece(move.charAt(0));
      move = move.substr(1);
    }

    switch (move.charAt(0)) {
    case '成':
      from.piece = to.piece;
      to.piece   = promote_map[to.piece];
      move       = move.substr(1);
      break;

    case '打':
      from.x = from.y = 0;
      move   = move.substr(1);
      break;
    }

    if (move.charAt(0) == '(') {
      from.x = parseInt(move.charAt(1));
      from.y = parseInt(move.charAt(2));
      move   = move.substr(4);
    }

    moves.setMove(num, params);
    return true;
  },

  parseStand: function(str, is_black) {
    if (str == 'なし') {
      return true;
    }

    var suite_init = this.kifu.suite_init;
    var list = str.split(/[\s　]+/);
    for (var i in list) {
      var value = list[i];
      var piece = Kifu.boardPieceToPiece(value.substr(0, 1));
      if (!piece) {
        continue;
      }
      var num = Kifu.kanjiToInteger(value.substr(1)) || 1;
      suite_init.standDeploy(piece, is_black, num);
    }

    return true;
  },

  prepare: function() {
    var kifu = this.kifu;
    var info = kifu.info;

    if (this._board_setup) {
      delete info.handicap;
    } else {
      if (!info.handicap) {
        info.handicap = 'even';
      }

      var handicap = info.handicap;
      kifu.suite_init.setup(handicap);
      if (handicap != 'even') {
        info.player_start = 'white';
      }
    }
  },

  strip: function(str) {
    return str.replace(/^[\s　]+/, '').replace(/[\s　]+$/, '');
  },

  toDate: function(str) {
    var date = new Date();
    date.setTime(Date.parse(str));
    return date;
  },

  toLines: function(source) {
    var result = [];
    var lines = source.split(/\r?\n|\r/);
    var l = lines.length;
    for (var i = 0; i < l; i++) {
      var line = lines[i];
      if (line) {
        result.push(lines[i]);
      }
    }
    return result;
  }
});

Kifu.Kif.extend({
  initialize: function(kifu) {
    this.kifu = kifu;
  }
});


Kifu.Kif.initialize.prototype = Kifu.Kif.prototype;
})(Kifu);

// Local variables:
// indent-tabs-mode: nil
// js2-basic-offset: 2
// end:
// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
/*
 * ki2.js
 *
 * Copyright 2011, Masato Bito
 * Licensed under the MIT license.
 *
 */
(function(Kifu) {
Kifu.Ki2 = (function(kifu) { return new Kifu.Ki2.initialize(kifu); });
Kifu.Ki2.extend = Kifu.Ki2.prototype.extend = Kifu.extend;


var promote_map = {
  FU: 'TO',
  KY: 'NY',
  KE: 'NK',
  GI: 'NG',
  KA: 'UM',
  HI: 'RY'
};

Kifu.Ki2.prototype.extend(Kifu.Kif.prototype);
Kifu.Ki2.prototype.extend({
  output: function() {
    var kifu = this.kifu;
    if (kifu.info.format == 'ki2') {
      return kifu.info.source;
    }

    var result = "# --- generated by jsShogiKifu ---\n";
    result += this.outputInfo(kifu.info);
    result += this.outputSuite(kifu.suite_init, kifu.info);
    result += this.outputMoves(kifu.moves);
    return result;
  },

  outputMoves: function(moves) {
    var result = '';

    var records = moves.records;
    var l       = records.length;
    for (var i = 1; i < l; i++) {
      var record = records[i];
      var from   = record.from;
      var to     = record.to;

      switch (record.type) {
      case 'move':
        result += (record.is_black ? '▲' : '△');
        if (record.is_same_place) {
          result += '同　';
        } else {
          result += Kifu.integerToZenkaku(to.x) + Kifu.integerToKanji(to.y);
        }
        result += Kifu.pieceToMovePiece(from.piece);
        if (record.direction) {
          result += Kifu.directionToKanji(record.direction);
        }
        if (record.movement) {
          result += Kifu.movementToKanji(record.movement);
        }
        if (from.piece != to.piece) {
          result += '成';
        }
        if (record.put) {
          result += '打';
        }
        break;
      }

      if ((i % 8) == 0) {
        result += "\n";
      }
    }

    return result;
  },

  parseByLineAsMove: function(line) {
    if (!line.match(/^[▽▼△▲]/)) {
      return false;
    }

    var moves   = this.kifu.moves;
    var p_infos = line;
    while (p_infos.match(/([▽▼△▲][^▽▼△▲]*)(.*)/)) {
      p_infos    = RegExp.$2;
      var p_info = this.strip(RegExp.$1);
      var params = {from: {}, to: {}};
      var from   = params.from;
      var to     = params.to;

      switch (p_info.charAt(0)) {
      case '▲':
      case '▼':
        params.is_black = true;
        break;
      case '△':
      case '▽':
        params.is_black = false;
        break;
      }
      p_info     = p_info.substr(1);
      params.str = p_info;

      if (p_info.charAt(0) == '同') {
        to.x   = 0;
        to.y   = 0;
        p_info = p_info.substr(1);
        if (p_info.charAt(0) == '　') {
          p_info = p_info.substr(1);
        }
      } else {
        to.x   = Kifu.zenkakuToInteger(p_info.charAt(0));
        to.y   = Kifu.kanjiToInteger(p_info.charAt(1));
        p_info = p_info.substr(2);
      }

      if (p_info.charAt(0) == '成') {
        from.piece = to.piece = Kifu.movePieceToPiece(p_info.substr(0, 2));
        p_info = p_info.substr(2);
      } else {
        from.piece = to.piece = Kifu.movePieceToPiece(p_info.charAt(0));
        p_info = p_info.substr(1);
      }

      var direction = Kifu.kanjiToDirection(p_info.charAt(0));
      if (direction) {
        params.direction = direction;
        p_info           = p_info.substr(1);
      }

      var movement = Kifu.kanjiToMovement(p_info.charAt(0));
      if (movement) {
        params.movement = movement;
        p_info          = p_info.substr(1);
      }

      switch (p_info) {
      case '成':
        from.piece = to.piece;
        to.piece   = promote_map[to.piece];
        p_info     = p_info.substr(1);
        break;

      case '打':
        from.x = from.y = 0;
        p_info = p_info.substr(1);
        break;
      }

      moves.addMove(params);
    }

    return true;
  }
});

Kifu.Ki2.extend({
  initialize: function(kifu) {
    this.kifu = kifu;
  }
});


Kifu.Ki2.initialize.prototype = Kifu.Ki2.prototype;
})(Kifu);

// Local variables:
// indent-tabs-mode: nil
// js2-basic-offset: 2
// end:
// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
/*
 * move.js
 *
 * Copyright 2011, Masato Bito
 * Licensed under the MIT license.
 *
 */
(function(Kifu) {
Kifu.Move = (function() { return new Kifu.Move.initialize(); });
Kifu.Move.extend = Kifu.Move.prototype.extend = Kifu.extend;


Kifu.Move.prototype.extend({
  addComment: function(comment) {
    var move = this.records[this.records.length-1];
    move.comment = (move.comment || '') + comment + "\n";
    return this;
  },

  addMove: function(params) {
    var move = this.newMove();
    move.type = 'move';
    for (var property in params) {
      move[property] = params[property];
    }
    return this;
  },

  addPeriod: function(period) {
    this.records[this.records.length-1].period = period;
    return this;
  },

  addSpecial: function(type, options) {
    var move = this.newMove();
    move.type = type;
    for (var property in options) {
      move[property] = options[property];
    }
    return this;
  },

  clone: function() {
    var obj = new Kifu.Move;
    obj.records = Kifu.clone(this.records);
    return obj;
  },

  get: function(step) {
    return this.records[step];
  },

  getLastMoveNum: function() {
    var move;
    var len = this.records.length;
    if (len <= 1) return 0;

    move = this.records[len - 1];
    if (move.type != 'move') len--; // ignore 'TORYO'
    return len - 1;   // ignore 'init'
  },

  newMove: function() {
    var move = this.records[this.records.length-1];
    if (move.type) {
      this.records.push({});
      move = this.records[this.records.length-1];
    }
    return move;
  },

  setMove: function(num, params) {
    var records = this.records;
    records[num] || (records[num] = {});
    var move = records[num];
    move.type = 'move';
    for (var property in params) {
      move[property] = params[property];
    }
    return this;
  }
});

Kifu.Move.extend({
  initialize: function() {
    this.records = [{type: 'init'}];
  }
});


Kifu.Move.initialize.prototype = Kifu.Move.prototype;
})(Kifu);

// Local variables:
// indent-tabs-mode: nil
// js2-basic-offset: 2
// end:
// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
/*
 * prepare.js
 *
 * Copyright 2011, Masato Bito
 * Licensed under the MIT license.
 *
 */
(function(Kifu) {


var original_piece_map = {
  FU: 'FU',
  KY: 'KY',
  KE: 'KE',
  GI: 'GI',
  KI: 'KI',
  KA: 'KA',
  HI: 'HI',
  OU: 'OU',
  TO: 'FU',
  NY: 'KY',
  NK: 'KE',
  NG: 'GI',
  UM: 'KA',
  RY: 'HI'
};

Kifu.Prepare = function(kifu) {
  return Kifu.Prepare.prepare(kifu);
};

Kifu.Prepare.extend = Kifu.extend;
Kifu.Prepare.extend({
  checkFromAreas: function(suite, move) {
    var board    = suite.board;
    var is_black = move.is_black;
    var piece    = move.from.piece;
    var result   = [];

    var areas  = Kifu.Prepare['findFromAreas'+piece](suite, move);
    var l      = areas.length;
    for (var i = 0; i < l; i++) {
      var area = areas[i];
      var x    = area[0];
      var y    = area[1];
      if (x < 1 || 9 < x || y < 1 || 9 < y) {
        continue;
      }
      var cell = board[x][y];
      if (cell && cell.is_black == is_black && cell.piece == piece) {
        result.push(area);
      }
    }

    return result;
  },

  checkStandArea: function(suite, move) {
    var is_black = move.is_black;
    var piece    = move.from.piece;
    var player   = is_black ? 'black' : 'white';

    if (suite.stand[player][piece] < 1) {
      return null;
    }

    if (piece != 'FU') {
      return [0, 0];
    }

    var board_x = suite.board[move.to.x];
    for (var y = 1; y <= 9; y++) {
      var cell = board_x[y];
      if (cell && cell.is_black == is_black && cell.piece == 'FU') {
        return null;
      }
    }

    return [0, 0];
  },

  findFromAreasFU: function(suite, move) {
    var to = move.to;
    var y  = to.y + (move.is_black ? 1 : -1);
    return [[to.x, y]];
  },

  findFromAreasKY: function(suite, move) {
    var board = suite.board;
    var to    = move.to;
    var x     = to.x;
    if (move.is_black) {
      for (var y = to.y + 1; y <= 9; y++) {
        if (board[x][y]) return [[x, y]];
      }
    } else {
      for (var y = to.y - 1; 1 <= y; y--) {
        if (board[x][y]) return [[x, y]];
      }
    }
    return [];
  },

  findFromAreasKE: function(suite, move) {
    var to = move.to;
    var x  = to.x;
    var y  = to.y + (move.is_black ? 2 : -2);
    return [[x+1, y], [x-1, y]];
  },

  findFromAreasGI: function(suite, move) {
    var to    = move.to;
    var x     = to.x;
    var y     = to.y;
    var areas = [[x+1, y+1], [x+1, y-1], [x-1, y+1], [x-1, y-1]];
    if (move.is_black) {
      areas.push([x, y+1]);
    } else {
      areas.push([x, y-1]);
    }
    return areas;
  },

  findFromAreasKI: function(suite, move) {
    var to    = move.to;
    var x     = to.x;
    var y     = to.y;
    var areas = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
    if (move.is_black) {
      areas.push([x+1, y+1]);
      areas.push([x-1, y+1]);
    } else {
      areas.push([x+1, y-1]);
      areas.push([x-1, y-1]);
    }
    return areas;
  },

  findFromAreasKA: function(suite, move) {
    var board = suite.board;
    var to    = move.to;
    var to_x  = to.x;
    var to_y  = to.y;
    var areas = [];

    for (var i = 1; i <= 8; i++) {
      var x = to_x + i; var y = to_y + i;
      if (x < 1 || 9 < x || y < 1 || 9 < y) break;
      if (board[x][y]) { areas.push([x, y]); break; }
    }
    for (var i = 1; i <= 8; i++) {
      var x = to_x + i; var y = to_y - i;
      if (x < 1 || 9 < x || y < 1 || 9 < y) break;
      if (board[x][y]) { areas.push([x, y]); break; }
    }
    for (var i = 1; i <= 8; i++) {
      var x = to_x - i; var y = to_y + i;
      if (x < 1 || 9 < x || y < 1 || 9 < y) break;
      if (board[x][y]) { areas.push([x, y]); break; }
    }
    for (var i = 1; i <= 8; i++) {
      var x = to_x - i; var y = to_y - i;
      if (x < 1 || 9 < x || y < 1 || 9 < y) break;
      if (board[x][y]) { areas.push([x, y]); break; }
    }

    return areas;
  },

  findFromAreasHI: function(suite, move) {
    var board = suite.board;
    var to    = move.to;
    var areas = [];

    var y = to.y;
    for (var x = to.x + 1; x <= 9; x++) {
      if (board[x][y]) { areas.push([x, y]); break; }
    }
    for (var x = to.x - 1; 1 <= x; x--) {
      if (board[x][y]) { areas.push([x, y]); break; }
    }

    var x = to.x;
    for (var y = to.y + 1; y <= 9; y++) {
      if (board[x][y]) { areas.push([x, y]); break; }
    }
    for (var y = to.y - 1; 1 <= y; y--) {
      if (board[x][y]) { areas.push([x, y]); break; }
    }

    return areas;
  },

  findFromAreasOU: function(suite, move) {
    var to = move.to;
    var x  = to.x;
    var y  = to.y;
    return [[x+1, y+1], [x+1, y], [x+1, y-1], [x, y+1], [x, y-1],
      [x-1, y+1], [x-1, y], [x-1, y-1]];
  },

  findFromAreasTO: function(suite, move) {
    return Kifu.Prepare.findFromAreasKI(suite, move);
  },

  findFromAreasNY: function(suite, move) {
    return Kifu.Prepare.findFromAreasKI(suite, move);
  },

  findFromAreasNK: function(suite, move) {
    return Kifu.Prepare.findFromAreasKI(suite, move);
  },

  findFromAreasNG: function(suite, move) {
    return Kifu.Prepare.findFromAreasKI(suite, move);
  },

  findFromAreasUM: function(suite, move) {
    var areas = Kifu.Prepare.findFromAreasKA(suite, move);
    var to    = move.to;
    var x     = to.x;
    var y     = to.y;
    areas.push([x+1, y]);
    areas.push([x-1, y]);
    areas.push([x, y+1]);
    areas.push([x, y-1]);
    return areas;
  },

  findFromAreasRY: function(suite, move) {
    var areas = Kifu.Prepare.findFromAreasHI(suite, move);
    var to    = move.to;
    var x     = to.x;
    var y     = to.y;
    areas.push([x+1, y+1]);
    areas.push([x+1, y-1]);
    areas.push([x-1, y+1]);
    areas.push([x-1, y-1]);
    return areas;
  },

  moveStr: function(move) {
    var from = move.from;
    var to   = move.to;
    var str  = '';
    if (move.is_same_place) {
      str += '同';
    } else {
      str += Kifu.integerToZenkaku(to.x) + Kifu.integerToKanji(to.y);
    }
    str += Kifu.pieceToMovePiece(from.piece);
    if (move.direction) {
      str += Kifu.directionToKanji(move.direction);
    }
    if (move.movement) {
      str += Kifu.movementToKanji(move.movement);
    }
    if (from.piece != to.piece) {
      str += '成';
    }
    if (move.put) {
      str += '打';
    }
    return str;
  },

  prepare: function(kifu) {
    var info = kifu.info;

    Kifu.Prepare.prepareInfo(info);

    var suite        = kifu.suite_init.clone();
    var move_records = kifu.moves.records;
    for (var i in move_records) {
      var m = move_records[i];
      if (!m || m.type != 'move') continue;
      m.from || (m.from = {});
      var move_prev = move_records[i-1];
      var move      = m;
      var from      = move.from;
      var to        = move.to;

      // is_black
      if (typeof move.is_black == 'undefined') {
        if (move_prev.type == 'init') {
          move.is_black = info.player_start == 'black';
        } else {
          move.is_black = !move_prev.is_black;
        }
      }

      // to cell
      if (to.x == 0) {
        to.x = move_prev.to.x;
        to.y = move_prev.to.y;
      }

      // from cell
      Kifu.Prepare.prepareFromCell(suite, move);

      // is_same_place
      if (typeof move.is_same_place == 'undefined') {
        if (move_prev.type == 'init') {
          move.is_same_place = false;
        } else {
          move.is_same_place = move_prev.to.x == to.x && move_prev.to.y == to.y;
        }
      }

      // stand
      var cell = suite.board[to.x][to.y];
      if (cell) {
        move.stand = {
          piece: cell.piece,
          stand: original_piece_map[cell.piece]
        };
      }

      move.str = Kifu.Prepare.moveStr(move);

      suite.move(move);
    }

    return kifu;
  },

  prepareFromCell: function(suite, move) {
    var from     = move.from;
    var is_black = move.is_black;
    var to       = move.to;

    move.direction = move.direction || false;
    move.movement  = move.movement  || false;
    move.put       = move.put       || false;

    Kifu.Prepare.prepareFromPiece(suite, move);

    var areas      = Kifu.Prepare.checkFromAreas(suite, move);
    var area_stand = Kifu.Prepare.checkStandArea(suite, move);

    var areas2 = Kifu.clone(areas);
    if (area_stand) {
      areas2.push(area_stand);
    }
    if (areas2.length == 1) {
      var area = areas2[0];
      from.x   = area[0];
      from.y   = area[1];
      return true;
    }

    if (from.x == 0 || move.put) {
      from.x = 0;
      from.y = 0;
      move.put = true;
      return true;
    }

    if (areas.length == 1) {
      var area = areas[0];
      from.x   = area[0];
      from.y   = area[1];
      return true;
    }

    if (move.direction || move.movement) {
      return Kifu.Prepare.prepareFromCellByMovement(move, areas);
    } else {
      return Kifu.Prepare.prepareMovement(move, areas);
    }
  },

  prepareFromCellByMovement: function(move, areas) {
    var is_black = move.is_black;
    var from     = move.from;
    var to       = move.to;
    var to_x     = to.x;
    var to_y     = to.y;
    var areas_l  = areas.length;

    var areas_x_less    = [];
    var areas_x_greater = [];
    var areas_x_equal   = [];
    for (var i = 0; i < areas_l; i++) {
      var area = areas[i];
      if (area[0] < to_x)      areas_x_less.push(area);
      else if (to_x < area[0]) areas_x_greater.push(area);
      else                     areas_x_equal.push(area);
    }

    switch (move.direction) {
    case 'left':
      areas   = is_black ? areas_x_greater : areas_x_less;
      areas_l = areas.length;
      break;
    case 'right':
      areas   = is_black ? areas_x_less : areas_x_greater;
      areas_l = areas.length;
      break;
    case 'straight_up':
      areas   = areas_x_equal;
      areas_l = areas.length;
      break;
    }

    var from_piece = from.piece;
    if (areas_l == 0 && (from_piece == 'UM' || from_piece == 'RY')) {
      areas   = areas_x_equal;
      areas_l = areas.length;
    }

    if (areas_l == 1) {
      var area = areas[0];
      from.x   = area[0];
      from.y   = area[1];
      return true;
    } 

    var areas_y_less    = [];
    var areas_y_greater = [];
    var areas_y_equal   = [];
    for (var i = 0; i < areas_l; i++) {
      var area = areas[i];
      if (area[1] < to_y)      areas_y_less.push(area);
      else if (to_y < area[1]) areas_y_greater.push(area);
      else                     areas_y_equal.push(area);
    }

    if (move.direction == 'straight_up') {
      areas = is_black ? areas_y_greater : areas_y_less;
    } else {
      switch (move.movement) {
      case 'down':
        areas = is_black ? areas_y_less : areas_y_greater;
        break;
      case 'up':
        areas = is_black ? areas_y_greater : areas_y_less;
        break;
      case 'horizon':
        areas = areas_y_equal;
        break;
      }
    }

    if (areas.length == 1) {
      var area = areas[0];
      from.x   = area[0];
      from.y   = area[1];
      return true;
    }

    return false;
  },

  prepareFromPiece: function(suite, move) {
    var from = move.from;

    if (from.piece) {
      return true;
    }

    if (from.x) {
      from.piece = suite.board[from.x][from.y].piece;
    } else {
      from.piece = move.to.piece;
    }

    return true;
  },

  prepareInfo: function(info) {
    if (!info.player_start) {
      info.player_start = 'black';
    }
    return info;
  },

  prepareMovement: function(move, areas) {
    var is_black = move.is_black;
    var from     = move.from;
    var from_x   = from.x;
    var from_y   = from.y;
    var to       = move.to;
    var to_x     = to.x;
    var to_y     = to.y;
    var areas_l  = areas.length;

    var areas_x_less    = [];
    var areas_x_greater = [];
    var areas_x_equal   = [];
    var areas_y_less    = [];
    var areas_y_greater = [];
    var areas_y_equal   = [];
    for (var i = 0; i < areas_l; i++) {
      var area = areas[i];
      if (area[0] < to_x)      areas_x_less.push(area);
      else if (to_x < area[0]) areas_x_greater.push(area);
      else                     areas_x_equal.push(area);
      if (area[1] < to_y)      areas_y_less.push(area);
      else if (to_y < area[1]) areas_y_greater.push(area);
      else                     areas_y_equal.push(area);
    }

    if (from_y < to_y && areas_y_less.length == 1) {
      move.direction = false;
      move.movement  = is_black ? 'down' : 'up';
      return true;
    } else if (to_y < from_y && areas_y_greater.length == 1) {
      move.direction = false;
      move.movement  = is_black ? 'up' : 'down';
      return true;
    } else if (from_y == to_y && areas_y_equal.length == 1) {
      move.direction = false;
      move.movement  = 'horizon';
      return true;
    }

    if (from_x < to_x) {
      move.direction = is_black ? 'right' : 'left';
      areas = areas_x_less;
    } else if (to_x < from_x) {
      move.direction = is_black ? 'left' : 'right';
      areas = areas_x_greater;
    } else {
      move.movement = false
      var piece = from.piece;
      if (piece == 'UM' || piece == 'RY') {
        if (1 <= areas_x_less.length) {
          move.direction = is_black ? 'left' : 'right';
        } else {
          move.direction = is_black ? 'right' : 'left';
        }
      } else {
        move.direction = 'straight_up';
      }
      return true;
    }
    areas_l = areas.length;

    if (areas_l == 1) {
      move.movement = false;
      return true;
    }

    if (from_y < to_y) {
      move.movement = is_black ? 'down' : 'up';
    } else if (to_y < from_y) {
      move.movement = is_black ? 'up' : 'down';
    } else {
      move.movement = 'horizon';
    }
    return true;
  }
});


})(Kifu);

// Local variables:
// indent-tabs-mode: nil
// js2-basic-offset: 2
// end:
// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
/*
 * suite.js
 *
 * Copyright 2011, Masato Bito
 * Licensed under the MIT license.
 *
 */
(function(Kifu) {
Kifu.Suite = (function() { return new Kifu.Suite.initialize(); });
Kifu.Suite.extend = Kifu.Suite.prototype.extend = Kifu.extend;


var piece_map = {
  FU: 'FU',
  KY: 'KY',
  KE: 'KE',
  GI: 'GI',
  KI: 'KI',
  KA: 'KA',
  HI: 'HI',
  OU: 'OU',
  TO: 'FU',
  NY: 'KY',
  NK: 'KE',
  NG: 'GI',
  UM: 'KA',
  RY: 'HI'
};

Kifu.Suite.prototype.extend({
  cellDeploy: function(x, y, piece, is_black) {
    var pieces = this.pieces;
    if (this.board[x][y]) {
      return false;
    }
    var piece_org = piece_map[piece];
    if (!pieces[piece_org]) {
      return false;
    }
    this.cellSet(x, y, piece, is_black);
    pieces[piece_org]--;
    return this;
  },

  cellGet: function(x, y) {
    return this.board[x][y];
  },

  cellRemove: function(x, y, piece) {
    var cell = this.board[x][y];
    if (!cell) {
      return false;
    }
    if (!this.cellTrash(x, y, piece)) {
      return false;
    }
    this.pieces[piece_map[cell.piece]]++;
    return this;
  },

  cellSet: function(x, y, piece, is_black) {
    this.board[x][y] = {is_black: is_black, piece: piece};
    return this;
  },

  cellTrash: function(x, y, piece) {
    var cell = this.board[x][y];
    if (!cell) {
      return false;
    }
    if (!piece) {
      piece = cell.piece;
    }
    if (piece != cell.piece) {
      return false;
    }

    this.board[x][y] = null;
    return this;
  },

  clone: function() {
    var obj = new Kifu.Suite;
    obj.board  = Kifu.clone(this.board);
    obj.pieces = Kifu.clone(this.pieces);
    obj.stand  = Kifu.clone(this.stand);
    return obj;
  },

  setup: function(handicap) {
    if (handicap == 'other') return this;
    this.hirate();
    if (handicap == 'even' || handicap == null) return this;

    switch (handicap) {
    case 'lance':
      this.cellRemove(1, 1, 'KY');
      break;

    case 'right_lance':
      this.cellRemove(9, 1, 'KY');
      break;

    case 'bishop':
      this.cellRemove(2, 2, 'KA');
      break;

    case 'rook_and_lance':
      this.cellRemove(1, 1, 'KY');
    case 'rook':
      this.cellRemove(8, 2, 'HI');
      break;

    case 'six_drops':
      this.cellRemove(2, 1, 'KE');
      this.cellRemove(8, 1, 'KE');
    case 'four_drops':
      this.cellRemove(1, 1, 'KY');
      this.cellRemove(9, 1, 'KY');
    case 'two_drops':
      this.cellRemove(8, 2, 'HI');
      this.cellRemove(2, 2, 'KA');
      break;

    default:
      alert('Invalid handicap: ' + this.handicap);
      break;
    }

    return this;
  },

  hirate: function() {
    this.cellDeploy(1, 9, 'KY', true);
    this.cellDeploy(2, 9, 'KE', true);
    this.cellDeploy(3, 9, 'GI', true);
    this.cellDeploy(4, 9, 'KI', true);
    this.cellDeploy(5, 9, 'OU', true);
    this.cellDeploy(6, 9, 'KI', true);
    this.cellDeploy(7, 9, 'GI', true);
    this.cellDeploy(8, 9, 'KE', true);
    this.cellDeploy(9, 9, 'KY', true);
    this.cellDeploy(8, 8, 'KA', true);
    this.cellDeploy(2, 8, 'HI', true);
    for (i = 1; i <= 9; i++) {
      this.cellDeploy(i, 7, 'FU', true);
    }

    this.cellDeploy(1, 1, 'KY', false);
    this.cellDeploy(2, 1, 'KE', false);
    this.cellDeploy(3, 1, 'GI', false);
    this.cellDeploy(4, 1, 'KI', false);
    this.cellDeploy(5, 1, 'OU', false);
    this.cellDeploy(6, 1, 'KI', false);
    this.cellDeploy(7, 1, 'GI', false);
    this.cellDeploy(8, 1, 'KE', false);
    this.cellDeploy(9, 1, 'KY', false);
    this.cellDeploy(2, 2, 'KA', false);
    this.cellDeploy(8, 2, 'HI', false);
    for (i = 1; i <= 9; i++) {
      this.cellDeploy(i, 3, 'FU', false);
    }

    return this;
  },

  move: function(move) {
    var is_black = move.is_black;
    var from     = move.from;
    var stand    = move.stand;
    var to       = move.to;

    if (from.x) {
      this.cellTrash(from.x, from.y);
    } else {
      this.standTrash(from.piece, is_black);
    }

    this.cellSet(to.x, to.y, to.piece, is_black);

    if (stand) {
      this.standSet(stand.stand, is_black);
    }

    return this;
  },

  moveReverse: function(move) {
    var is_black = move.is_black;
    var from     = move.from;
    var stand    = move.stand;
    var to       = move.to;

    if (stand) {
      this.standTrash(stand.stand, is_black);
      this.cellSet(to.x, to.y, stand.piece, !is_black);
    } else {
      this.cellTrash(to.x, to.y);
    }

    if (from.x) {
      this.cellSet(from.x, from.y, from.piece, is_black);
    } else {
      this.standSet(from.piece, is_black);
    }

    return this;
  },

  standDeploy: function(piece, is_black, num) {
    var player = is_black ? 'black' : 'white';
    var stand  = this.stand[player];
    var pieces = this.pieces;

    num = num || 1;

    if (piece == 'AL') {
      for (var p in pieces) {
        if (p == 'OU') {
          continue;
        }
        stand[p] || (stand[p] = 0);
        stand[p] += pieces[p];
        pieces[p] = 0;
      }
    } else if (pieces[piece] >= num) {
      this.standSet(piece, is_black, num);
      pieces[piece] -= num;
    } else {
      return false;
    }

    return this;
  },

  standRemove: function(piece, is_black) {
    if (!this.standTrash(piece, is_black)) {
      return false;
    }
    this.pieces[piece]++;
    return this;
  },

  standSet: function(piece, is_black, num) {
    var player = is_black ? 'black' : 'white';
    var stand = this.stand[player];
    num = num || 1;
    stand[piece] || (stand[piece] = 0);
    stand[piece] += num;
    return this;
  },

  standTrash: function(piece, is_black) {
    var player = is_black ? 'black' : 'white';
    var stand = this.stand[player];
    if (!stand[piece]) {
      return false;
    }
    stand[piece]--;
    return this;
  }
});

Kifu.Suite.extend({
  initialize: function() {
    this.board  = Kifu.Suite.boardEmpty();
    this.pieces = Kifu.Suite.piecesDefault();
    this.stand  = {
      black: Kifu.Suite.standEmpty(),
      white: Kifu.Suite.standEmpty()};
  },

  boardEmpty: function() {
    var board = {};
    for (var i = 1; i <= 9; i++) {
      board[i] = {}
      for (var j = 1; j <= 9; j++) {
        board[i][j] = null;
      }
    }
    return board;
  },

  piecesDefault: function() {
    return {FU: 18, KY: 4, KE: 4, GI: 4, KI: 4, KA: 2, HI: 2, OU: 2};
  },

  standEmpty: function() {
    return {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0, OU: 0};
  }
});


Kifu.Suite.initialize.prototype = Kifu.Suite.prototype;
})(Kifu);

// Local variables:
// indent-tabs-mode: nil
// js2-basic-offset: 2
// end:
// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
