'use strict';

var debug = require('debug')('game');
var db = require('./database')();
var Stack = require('./stack');
var Player = require('./player');
var util = require('./util');

function Game(options) {

  var id = util.generateUID();
  var io = global.socketIO;
  var players = [];
  var playerLimit = 8;

  var whiteCards = new Stack();
  var whiteDiscards = new Stack();
  var blackCards = new Stack();
  var blackDiscards = new Stack();

  function init() {
    return new Promise(function(resolve, reject) {
      db.open();
      db.getCardsFromDecks(options.decks, function(white, black) {
        whiteCards.add(white);
        blackCards.add(black);
        whiteCards.shuffle();
        blackCards.shuffle();
        db.close();
        resolve(true);
      });
    });
  }

  function info() {
    return {
      id: id,
      name: options.name,
      playerLimit: playerLimit,
      playerCount: players.length
    };
  }

  function join(playerInfo, cb) {
    if (players.length < playerLimit) {
      var player = new Player(playerInfo);
      player.hand.add(whiteCards.draw(10));
      players.push(player);
      io.to(player.socketId).emit('joinedGame', info());
      io.to(player.socketId).emit('hand', player.hand.get());
      cb(false, {
        game: info(),
        hand: player.hand.get()
      });
    } else {
      cb(true, {msg: 'Game is full.'});
    }
  }

  function leave(playerId) {
    debug(players);
    var index = util.findIndexByKeyValue(players, 'id', playerId);
    if (index >= 0) {
      message({
        type: 'update',
        msg: players[index].name + ' has left the game.'
      });
      players.splice(index, 1);
    }
    debug(players);
  }

  function message(data) {
    io.to(id).emit('message', data);
  }

  return {
    id: id,
    init: init,
    info: info,
    join: join,
    leave: leave
  };

}

module.exports = Game;
