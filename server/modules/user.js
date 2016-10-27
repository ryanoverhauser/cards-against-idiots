'use strict';

var debug = require('debug')('user');
var validator = require('validator');

var cardcast = require('./cardcast')();
var lobby = require('./lobby');
var util = require('./util');

var Game = require('./game');

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
  socket.on('message', onMessage);
  socket.on('disconnect', onDisconnect);
  socket.on('submitAnswer', onSubmitAnswer);

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

  function info() {
    return {
      id: id,
      name: name,
      socketId: socket.client.id
    };
  }

  function joinGame(game) {
    game.join(info())
    .then(() => {
      currentGame = game;
      socket.join(game.id);
      socket.leave('lobby');
      debug('User ' + name + ' joined game ' + game.name);
    })
    .catch(function(err) {
      debug('Error joining game:', err);
    });
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
    var newGame = new Game(data);
    newGame.init()
    .then(() => {
      lobby.addGame(newGame);
      joinGame(newGame);
    })
    .catch((err) => {
      debug('Error creating game:', err);
    });
  }

  function onJoinGame(data) {
    var game = lobby.getGame(data.gameId);
    if (game) {
      joinGame(game);
    }
  }

  function onLeaveGame() {
    socket.join('lobby');
    socket.emit('leftGame');
    if (currentGame) {
      currentGame.leave(id);
      currentGame = false;
    }
  }

  function onMessage(data) {
    if (currentGame) {
      currentGame.sendChatMessage(name, data.message);
    }
  }

  function onDisconnect() {
    if (currentGame) {
      currentGame.leave(id);
      currentGame = false;
    }
  }

  function onSubmitAnswer(data) {
    debug(currentGame.round);
    if (currentGame && currentGame.round) {
      currentGame.round.submitAnswer({
        userId: id,
        cards: data
      });
    }
  }

  return {
    id: id
  }

};

module.exports = User;
