'use strict';

var debug = require('debug')('round');
var Stack = require('./stack');
var util = require('./util');

function Round(game) {
  var answers = new Stack();
  var io = global.socketIO;
  var state = 'waiting';

  if (!game.blackCards.count()) {
    game.reshuffleBlack();
  }
  var prompt = game.blackCards.drawOne();

  pickCzar();

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
    for (let answer of answers.get()) {
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

  /* Check that the round still has a czar, otherwise reset the round */
  function czarCheck() {
    var czar = util.findByKeyValue(game.players, 'czar', true);
    if (!czar) {
      debug('czar has left');
      game.sendMessage('Card Czar has left the game. Reseting round...', 'info');
      pickCzar();
      game.deal();
      reset();
    }
  }

  /* Assign round czar */
  function pickCzar() {
    if (game.players.length) {
      var currentCzarIndex = util.findIndexByKeyValue(game.players, 'czar', true);
      if (currentCzarIndex >= 0) {
        game.players[currentCzarIndex].czar = false;
      }
      if (currentCzarIndex < (game.players.length - 1)) {
        game.players[currentCzarIndex + 1].czar = true;
      } else {
        game.players[0].czar = true;
      }
    }
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
        game.sendMessage(winner.name + ' wins the round!', 'info');
        winner.score += 1;
      }
      cleanup();
      game.newRound();
    }
  }

  /* Re-initalize the round */
  function reset() {
    debug('resetting round');
    answers = new Stack();
    state = 'waiting';

    for (let player of game.players) {
      player.answered = false;
    };

    io.to(game.id).emit('resetRound');
  }

  /* Handle player submitting an answer */
  function submitAnswer(answer) {
    debug(answer);
    var player = util.findByKeyValue(game.players, 'id', answer.userId);
    if (player) {
      player.answered = true;
      answers.add(answer);
      answers.shuffle();
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
      status.answers = answers.get();
    }
    return status;
  }

  /* Update round status */
  function update() {
    czarCheck();
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
          game.sendMessage('Too few players. Resetting round...', 'info');
          reset();
          io.to(game.id).emit('roundStatus', status());
        } else {
          if (allAnswered()) {
            state = 'closed';
            game.sendMessage('The answers are in. Waiting on the Card Czar...', 'info');
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
