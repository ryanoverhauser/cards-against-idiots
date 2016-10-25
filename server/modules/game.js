'use strict';

var debug = require('debug')('game');

var db = require('./database')();
var lobby = require('./lobby');
var util = require('./util');

var Stack = require('./stack');
var Player = require('./player');
var Round = require('./round');

function Game(gameOpts) {

  var id = util.generateUID();
  var io = global.socketIO;
  var name = gameOpts.name;
  var players = [];
  var currentRound;

  var whiteCards = new Stack();
  var whiteDiscards = new Stack();
  var blackCards = new Stack();
  var blackDiscards = new Stack();

  function init() {
    return db.getCardsFromDecks(gameOpts.decks)
    .then((result) => {
      whiteCards.add(result.whiteCards);
      blackCards.add(result.blackCards);
      whiteCards.shuffle();
      blackCards.shuffle();
      newRound();
      debug('Game initialized: ' + info());
      return true;
    });
  }

  function newRound() {
    currentRound = new Round(id, gameOpts, blackCards.drawOne(), players);
    io.to(id).emit('newRound', currentRound.status());
  }

  function info() {
    return {
      id: id,
      name: name,
      czarTime: gameOpts.czarTime,
      playerLimit: gameOpts.playerLimit,
      playerCount: players.length,
      roundTime: gameOpts.roundTime,
      scoreLimit: gameOpts.scoreLimit,
      round: currentRound.status()
    };
  }

  function scoreboard() {
    var scoreboard = [];
    for (let p of players) {
      scoreboard.push({
        name: p.name,
        score: p.score(),
        wins: p.wins(),
      });
    }
    return scoreboard;
  }

  function join(playerInfo) {
    return new Promise((resolve, reject) => {
      if (players.length === gameOpts.playerLimit) {
        reject('Game is full');
      }
      var player = new Player(playerInfo);
      player.hand.add(whiteCards.draw(10));
      players.push(player);
      message(player.name + ' joined the game.');
      currentRound.update();
      io.to(player.socketId).emit('joinedGame', {
        round: currentRound.status(),
        scoreboard: scoreboard()
      });
      io.to(player.socketId).emit('hand', player.hand.get());
      resolve();
    });
  }

  function leave(playerId) {
    var index = util.findIndexByKeyValue(players, 'id', playerId);
    if (index >= 0) {
      message({
        type: 'update',
        msg: players[index].name + ' has left the game.'
      });
      players.splice(index, 1);
    }
    if (!players.length) {
      lobby.removeGame(id);
    }
  }

  function message(msg, type) {
    type = type || 'update';
    io.to(id).emit('message', {
      msg: msg,
      type: type
    });
  }

  return {
    id: id,
    name: name,
    init: init,
    info: info,
    join: join,
    leave: leave,
    scoreboard: scoreboard
  };

}

module.exports = Game;
