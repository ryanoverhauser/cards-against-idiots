'use strict';

var debug = require('debug')('server');
var express = require('express');
var http = require('http');

var User = require('./modules/user');

function Server() {

  var app = express();
  var server = http.Server(app);

  // Setup Express App
  app.use(express.static(__dirname + '/../client/dist'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'pug');
  app.engine('html', require('pug').__express);
  app.locals.pretty = true;

  // Sockets
  var io = require('socket.io')(server);
  global.socketIO = io;
  io.sockets.on('connection', function (socket) {
    var user = new User(socket);
    debug('user connected: ' + socket.client.id);
  });

  // Routing
  var appSocketUrl = process.env.PROTOCOL +
    '://' + process.env.HOST +
    ':' + process.env.PORT;

  app.get('/', function(req, res) {
    res.render('main', {
      appSocketUrl: appSocketUrl
    });
  });

  app.get('/templates/create', function(req, res) {
    res.render('templates/create');
  });

  // Start listening
  server.listen(process.env.PORT, function() {
    debug('Example app listening on port ' + process.env.PORT + '!');
  });

}

module.exports = Server;
