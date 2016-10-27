'use strict';

var debug = require('debug')('round');
var Stack = require('./stack');
var util = require('./util');

function Round(game) {
  var answers = [];
  var io = global.socketIO;
  var state = 'waiting';
  var prompt = game.blackCards.drawOne();

  function submitAnswer(answer) {
    debug(answer);
    var player = util.findByKeyValue(game.players, 'id', answer.userId);
    if (player) {
      player.answered = true;
      answers.push(answer);
      update();
      game.sendUpdate();
    }
  }

  function allAnswered() {
    var allAnswered = true;
    game.players.map(function(p) {
      if (!p.answered && !p.czar) {
        allAnswered = false;
      }
    });
    return allAnswered;
  }

  function status() {
    return {
      state: state,
      prompt: prompt
    }
  }

  function update() {
    switch (state) {
      case 'waiting':
        if (game.players.length > 2) {
          state = 'open';
          io.to(game.id).emit('roundStatus', status());
        }
        break;
      case 'open':
        if (game.players.length < 3) {
          state = 'waiting';
          io.to(game.id).emit('roundStatus', status());
        } else {
          if (allAnswered()) {
            state = 'closed';
          }
        }
        break;
      case 'closed':
        break;
    }
  }

  return {
    submitAnswer: submitAnswer,
    status: status,
    update: update
  }

}

module.exports = Round;
