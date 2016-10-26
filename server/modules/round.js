'use strict';

var debug = require('debug')('round');
var Stack = require('./stack');
var util = require('./util');

function Round(gameId, gameOpts, prompt, players) {
  var answers = [];
  var io = global.socketIO;
  var state = 'waiting';

  function status() {
    return {
      state: state,
      prompt: prompt
    }
  }

  function update() {
    switch (state) {
      case 'waiting':
        if (players.length > 2) {
          state = 'open';
          io.to(gameId).emit('roundStatus', status());
        }
        break;
      case 'open':
        if (players.length < 3) {
          state = 'waiting';
          io.to(gameId).emit('roundStatus', status());
        }
        break;
      case 'closed':
        break;
    }
  }

  return {
    status: status,
    update: update,
  }

}

module.exports = Round;
