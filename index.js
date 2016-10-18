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
var appSocketUrl = process.env.protocol + '://' + process.env.host + ':' + process.env.port;

app.get('/', function (req, res) {
  res.render('main', {
    appSocketUrl: appSocketUrl
  });
});

// Start listening
server.listen(process.env.port, function () {
  debug('Example app listening on port ' + process.env.port + '!');
});