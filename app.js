var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var scraping = require('./routes/scraping');
var date = require('./routes/date');
var first = require('./routes/first');
var second = require('./routes/second');
var match = require('./routes/match');
var start = require('./routes/start');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/scraping', scraping);
app.use('/date', date);
app.use('/first', first);
app.use('/second', second);
app.use('/match', match);
app.use('/start', start);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var KifuSchema = new Schema({
    date: String,
    match: String,
    first: String,
    second: String,
    moves: Array,
    data: String,
});
var TagSchema = new Schema({
    tag: { 
        type: String, 
        unique: true
    }
});
var TagDateSchema = TagSchema;
var TagMatchSchema = TagSchema;
var TagFirstSchema = TagSchema;
var TagSecondSchema = TagSchema;
var TagMovesSchema = TagSchema;
var TagStartSchema = TagSchema;
mongoose.model('Kifu', KifuSchema);
mongoose.model('TagDate', TagDateSchema);
mongoose.model('TagMatch', TagMatchSchema);
mongoose.model('TagFirst', TagFirstSchema);
mongoose.model('TagSecond', TagSecondSchema);
mongoose.model('TagMoves', TagMovesSchema);
mongoose.model('TagStart', TagStartSchema);
mongoose.connect('mongodb://localhost/dblec');

module.exports = app;
