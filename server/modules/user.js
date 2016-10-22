'use strict';

var debug = require('debug')('user');
var util = require('./util');
var validator = require('validator');

var cardcast = require('./cardcast')();
var lobby = require('./lobby')();

function User(socket) {

  var id = util.generateUID();
  var socket = socket;
  var name;
  var initialized = false;
  var currentGame = false;

  socket.on('init', init);
  socket.on('loadCustomDeck', onLoadCustomDeck);
  socket.on('createGame', onCreateGame);
  socket.on('joinGame', onJoinGame);
  socket.on('leaveGame', onLeaveGame);

  function init(data) {
    if (!initialized && util.exists(data)) {
      if (validator.isLength(data.name, 1, 20)) {
        name = data.name;
        initialized = true;
        debug('user initialized with name: ' + name);
        socket.join('lobby');
        socket.emit('initialized', {
          userId: id,
          userName: name,
          games: lobby.listGames(),
          decks: lobby.listDecks()
        });
      } else {
        socket.emit('alert', {
          type: warning,
          msg: 'Please choose a name between 1 and 20 characters.'
        });
      }
    }
  }

  function player() {
    return {
      id: id,
      name: name
    };
  }

  function joinGame(gameId) {
    var game = lobby.getGame(gameId);
    if (game) {
      game.join(player(), function(err, data) {
        if (err) {
          debug('Error: ' + data.msg);
        } else {
          debug(data);
          currentGame = game;
          socket.emit('joinedGame', game.info());
          socket.join(game.id);
        }
      });
    }
  }

  function onLoadCustomDeck(data) {
    if (util.exists(data.deckId)) {
      cardcast.getDeck(data.deckId, function(deck) {
        if (util.exists(deck.id) && deck.id === 'not_found') {
          socket.emit('customDeckLoaded', {
            err: 'Deck not found'
          });
        } else {
          socket.emit('customDeckLoaded', {
            deck: deck
          });
        }
      });
    }
  }

  function onCreateGame(data) {
    var gameId = lobby.createGame(data);
    joinGame(gameId);
  }

  function onJoinGame(data) {
    joinGame(data.gameId);
  }

  function onLeaveGame() {
    if (currentGame) {
      currentGame.leave(id);
    }
    socket.emit('leftGame', {
      games: lobby.listGames()
    });
  }

  return {
    id: id
  }

};

module.exports = User;
