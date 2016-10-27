'use strict';

var Stack = require('./stack');

function Player(playerInfo) {

  var player = {
    answered: false,
    id: playerInfo.id,
    name: playerInfo.name,
    socketId: playerInfo.socketId,
    score: 0,
    wins: 0,
    czar: false
  }

  player.hand = new Stack();

  return player;

}

module.exports = Player;
