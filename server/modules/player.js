'use strict';

var Stack = require('./stack');

function Player(playerInfo) {

  var id = playerInfo.id;
  var name = playerInfo.name;
  var socketId = playerInfo.socketId;
  var score = 0;
  var wins = 0;
  var czar = false;
  var hand = new Stack();

  return {
    id: id,
    name: name,
    socketId: socketId,
    score: score,
    wins: wins,
    czar: czar,
    hand: hand
  }

}

module.exports = Player;
