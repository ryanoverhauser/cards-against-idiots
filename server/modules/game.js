'use strict';

var debug = require('debug')('game');
var db = require('./database')();
var Stack = require('./stack');
var Player = require('./player');
var util = require('./util');

function Game(options) {

  var id = util.generateUID();
  var io = global.socketIO;
  var name = options.name;
  var players = [];
  var playerLimit = 8;

  var whiteCards = new Stack();
  var whiteDiscards = new Stack();
  var blackCards = new Stack();
  var blackDiscards = new Stack();

  function init() {
    return db.getCardsFromDecks(options.decks)
    .then((result) => {
      whiteCards.add(result.whiteCards);
      blackCards.add(result.blackCards);
      whiteCards.shuffle();
      blackCards.shuffle();
      debug('Game initialized: ' + name);
      return true;
    });
  }

  function info() {
    return {
      id: id,
      name: name,
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
