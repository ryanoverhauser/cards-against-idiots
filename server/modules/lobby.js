'use strict';

var debug = require('debug')('lobby');
var database = require('./database');
var Game = require('./game');

function Lobby() {

  var games = [];
  var decks = false;
  var initialized = false;
  var updateInterval;
  var io;

  init();

  function init() {
    debug('Loading decks...');
    var db = database();
    db.open();
    db.getDecks(function(data){
      db.close();
      decks = data;
      initialized = true;
      debug('Decks loaded');
      updateInterval = setInterval(update, 15000);
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
    games.forEach(function(game){
      gamesList.push(game.info());
    });
    return gamesList;
  }

  function listDecks() {
    return decks;
  }

  function createGame(options) {
    var newGame = new Game(options);
    games.push(newGame);
    update();
  }

  return {
    listGames: listGames,
    listDecks: listDecks,
    createGame: createGame
  }

}

module.exports = Lobby;
