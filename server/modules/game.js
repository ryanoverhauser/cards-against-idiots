'use strict';

var debug = require('debug')('game');

var db = require('./database')();
var lobby = require('./lobby');
var util = require('./util');

var Stack = require('./stack');
var Player = require('./player');
var Round = require('./round');

function Game(gameOpts) {

  var id = util.generateUID();
  var io = global.socketIO;
  var name = gameOpts.name;
  var players = [];
  var currentRound;

  var whiteCards = new Stack();
  var whiteDiscards = new Stack();
  var blackCards = new Stack();
  var blackDiscards = new Stack();

  function init() {
    return db.getCardsFromDecks(gameOpts.decks)
    .then((result) => {
      whiteCards.add(result.whiteCards);
      blackCards.add(result.blackCards);
      whiteCards.shuffle();
      blackCards.shuffle();
      debug('Game initialized: ' + info());
      return true;
    });
  }

  function newRound() {
    pickCzar();
    currentRound = new Round(id, gameOpts, blackCards.drawOne(), players);
    io.to(id).emit('newRound', currentRound.status());
  }

  function pickCzar() {
    if (players.length) {
      var currentCzarIndex = util.findIndexByKeyValue(players, 'czar', true);
      if (currentCzarIndex >= 0) {
        players[currentCzarIndex].czar = false;
      }
      if (currentCzarIndex < (players.length - 1)) {
        players[currentCzarIndex + 1].czar = true;
      } else {
        players[0].czar = true;
      }
    }
  }

  function info() {
    return {
      id: id,
      name: name,
      czarTime: gameOpts.czarTime,
      playerLimit: gameOpts.playerLimit,
      playerCount: players.length,
      roundTime: gameOpts.roundTime,
      scoreLimit: gameOpts.scoreLimit
    };
  }

  function playerList() {
    var playerList = [];
    for (let p of players) {
      playerList.push({
        id: p.id,
        name: p.name,
        score: p.score,
        wins: p.wins,
        czar: p.czar,
      });
    }
    return playerList;
  }

  function join(playerInfo) {
    return new Promise((resolve, reject) => {

      /* Check that game is not full */
      if (players.length === gameOpts.playerLimit) {
        reject('Game is full');
      }

      /* Setup new player and add to players array */
      var player = new Player(playerInfo);
      player.hand.add(whiteCards.draw(10));
      players.push(player);

      /* Update the round or create new round if not set */
      if (!currentRound) {
        newRound();
      } else {
        currentRound.update();
      }

      /* Send game info to player */
      io.to(player.socketId).emit('joinedGame', {
        round: currentRound.status(),
        players: playerList()
      });
      io.to(player.socketId).emit('hand', player.hand.get());

      /* Alert other clients */
      sendMessage(player.name + ' joined the game.');
      sendUpdate();

      resolve();
    });
  }

  function leave(playerId) {
    var index = util.findIndexByKeyValue(players, 'id', playerId);
    if (index >= 0) {
      /* Alert other clients */
      sendMessage(players[index].name + ' has left the game.');
      players.splice(index, 1);
      sendUpdate();
    }
    if (!players.length) {
      lobby.removeGame(id);
    }
  }

  function sendUpdate() {
    io.to(id).emit('updateGame', {
      round: currentRound.status(),
      players: playerList()
    });
  }

  function sendMessage(text, type) {
    type = type || 'update';
    io.to(id).emit('message', {
      text: text,
      type: type
    });
  }

  function sendChatMessage(username, text) {
    io.to(id).emit('message', {
      text: text,
      type: 'chat',
      user: username
    });
  }

  function submitAnswer(userId, answer) {
    debug('submitAnswer', userId, answer);
  }

  return {
    id: id,
    name: name,
    init: init,
    info: info,
    join: join,
    leave: leave,
    players: playerList,
    sendChatMessage: sendChatMessage,
    submitAnswer: submitAnswer
  };

}

module.exports = Game;
