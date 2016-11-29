'use strict';

var debug = require('debug')('server');
var express = require('express');
var http = require('http');
var timesyncServer = require('timesync/server');

var User = require('./modules/user');

function Server() {

  var app = express();
  var server = http.Server(app);
  var protocol = process.env.PROTOCOL || 'http';
  var host = process.env.HOST || 'localhost';
  var port = process.env.PORT || '8080';

  // Setup Pug template engine
  app.set('views', __dirname + '/views');
  app.set('view engine', 'pug');
  app.engine('html', require('pug').__express);
  app.locals.pretty = true;

  // Static assets
  app.use(express.static(__dirname + '/../client/dist'));

  // Handle timesync requests
  app.use('/timesync', timesyncServer.requestHandler);

  // Sockets
  var io = require('socket.io')(server);
  global.socketIO = io;
  io.sockets.on('connection', function (socket) {
    var user = new User(socket);
    debug('user connected: ' + socket.client.id);
  });

  // Routing
  var appSocketUrl = protocol + '://' + host + ':' + port;

  app.get('/', function(req, res) {
    res.render('main', {
      appSocketUrl: appSocketUrl
    });
  });

  app.get('/templates/create', function(req, res) {
    res.render('templates/create');
  });

  // Start listening
  server.listen(port, function() {
    debug('Listening on port ' + port + '!');
  });

}

module.exports = Server;
