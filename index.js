'use strict';

var debug = require('debug')('server'),
    dotenv = require('dotenv'),
    express = require('express');
    
// Load .env
dotenv.config({silent: true});

// Setup Express App
var app = express();
app.use(express.static(__dirname + '/client/dist'));
app.set('views', __dirname + '/server/views');
app.set('view engine', 'pug');
app.engine('html', require('pug').__express);
app.locals.pretty = true;

// Socket
var server = require('http').Server(app),
    socket = require('./server/modules/socket')(server);

// Routing
var appSocketUrl = process.env.PROTOCOL + '://' + process.env.HOST + ':' + process.env.PORT;

app.get('/', function (req, res) {
  res.render('main', {
    appSocketUrl: appSocketUrl
  });
});

app.get("/templates/create", function(req, res){
    res.render("templates/create");
});

// Start listening
server.listen(process.env.PORT, function () {
  debug('Example app listening on port ' + process.env.PORT + '!');
});