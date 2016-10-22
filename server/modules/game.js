'use strict';

var debug = require('debug')('game');
var util = require('./util');

function Game(options) {

  var id = util.generateUID();
  var io = global.socketIO;
  var players = [];
  var playerLimit = 8;

  function info() {
    return {
      id: id,
      name: options.name,
      playerLimit: playerLimit,
      playerCount: players.length
    };
  }

  function join(player, cb) {
    if (players.length < playerLimit) {
      players.push(player);
      cb(false, info());
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
        msg: players[index].name + ' has left the game '
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
    info: info,
    join: join,
    leave: leave
  };

}

module.exports = Game;
