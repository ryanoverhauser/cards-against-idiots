'use strict';

var debug = require('debug')('game');
var util = require('./util');

function Game(options) {

  var id = util.generateUID();
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

  return {
    id: id,
    info: info
  };

}

module.exports = Game;
