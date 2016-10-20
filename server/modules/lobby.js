'use strict';

var debug = require('debug')('lobby');
var database = require('./database');

function Lobby(){

  var games = [{
    name: "Demo Game",
    playerCount: 5,
    playerLimit: 8
  }];
  var decks = false;
  var initialized = false;
  var updateInterval;
  var io;

  init();

  function init(){
    debug('Loading decks...');
    var db = database();
    db.open();
    db.getDecks(function(data){
      db.close();
      decks = data;
      initialized = true;
      debug("Decks loaded");
      updateInterval = setInterval(update, 15000);
    }); 
  };

  function update() {
    if (io = global.socketIO) {
      io.to('lobby').emit('gameList', {
        games: games,
        decks: decks
      });
    }
  }

  function listGames(){
    return games;
  }

  function listDecks(){
    return decks;
  }

  return {
    listGames: listGames,
    listDecks: listDecks
  }
    
}

module.exports = Lobby;