'use strict';

var debug = require('debug')('lobby');

var db = require('./database');
var util = require('./util');

function Lobby() {

  var games = [];
  var decks = false;
  var initialized = false;
  var updateInterval;
  var io;

  init();

  function init() {
    db.getDecks()
    .then(function(rows) {
      decks = rows;
      debug('Decks loaded');
      initialized = true;
      updateInterval = setInterval(update, 15000);
      debug('Initialized');
    })
    .catch(function(err) {
      debug('Error getting decks', err);
    });
  };

  function update() {
    if (io = global.socketIO) {
      io.to('lobby').emit('updateLobby', {
        games: listGames(),
        decks: decks
      });
    }
  }

  function listGames() {
    var gamesList = [];
    games.forEach(function(game) {
      gamesList.push(game.info());
    });
    return gamesList;
  }

  function listDecks() {
    return decks;
  }

  function getGame(gameId) {
    return util.findByKeyValue(games, 'id', gameId);
  }

  function addGame(game) {
    games.push(game);
    update();
    debug('Added new game: ' + game.name);
  }

  function removeGame(gameId) {
    var i = util.findIndexByKeyValue(games, 'id', gameId);
    if (i >= 0) {
      debug('Removing empty game: ' + games[i].name);
      games.splice(i, 1);
      update();
    }
  }

  function status() {
    return {
      games: listGames(),
      decks: decks
    };
  }

  return {
    listGames: listGames,
    listDecks: listDecks,
    addGame: addGame,
    getGame: getGame,
    removeGame: removeGame,
    status: status
  }

}

module.exports = Lobby();
