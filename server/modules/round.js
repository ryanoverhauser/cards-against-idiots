'use strict';

var debug = require('debug')('round');
var Stack = require('./stack');
var util = require('./util');

function Round(game) {
  var answers = [];
  var io = global.socketIO;
  var state = 'waiting';
  var prompt = game.blackCards.drawOne();

  /* Chech if all players have submitted an answer */
  function allAnswered() {
    var allAnswered = true;
    for (let player of game.players) {
      if (!player.answered && !player.czar) { // still waiting on answer
        allAnswered = false;
      }
    };
    return allAnswered;
  }

  /* Cleanup after round ends */
  function cleanup() {
    // Discard prompt card
    game.blackDiscards.add([prompt]);
    // Discard answer cards and remove from player hands
    for (let answer of answers) {
      game.whiteDiscards.add(answer.cards);
      var player = util.findByKeyValue(game.players, 'id', answer.userId);
      if (player) {
        for (let card of answer.cards) {
          player.hand.removeById(card.id);
        };
      }
    };
    // Reset player status
    for (let player of game.players) {
      player.answered = false;
    };
  }

  /* Handle czar choosing round winner */
  function pickWinner(userId, answer) {
    debug('pickWinner', answer);
    var czar = util.findByKeyValue(game.players, 'id', userId);
    //confirm the player is actually the card czar
    if (czar.czar) {
      io.to(game.id).emit('roundEnded', answer);
      // Award point to round winner
      var winner = util.findByKeyValue(game.players, 'id', answer.userId);
      if (winner) {
        winner.score += 1;
      }
      cleanup();
      game.newRound();
    }
  }

  /* Handle player submitting an answer */
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

  /* Get round status */
  function status() {
    var status = {
      state: state,
      prompt: prompt
    }
    if (allAnswered()) {
      status.answers = answers;
    }
    return status;
  }

  /* Update round status */
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
    pickWinner: pickWinner,
    prompt: prompt,
    submitAnswer: submitAnswer,
    status: status,
    update: update
  }

}

module.exports = Round;
