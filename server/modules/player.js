'use strict';

var Stack = require('./stack');

function Player(playerInfo) {

  var id = playerInfo.id;
  var name = playerInfo.name;
  var socketId = playerInfo.socketId;
  var score = 0;
  var wins = 0;
  var hand = new Stack();

  function getScore() {
    return score;
  }

  function getWins() {
    return wins;
  }

  return {
    id: id,
    name: name,
    socketId: socketId,
    score: getScore,
    wins: getWins,
    hand: hand
  }

}

module.exports = Player;
