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

  var game = {
    id: id,
    name: gameOpts.name,
    init: init,
    info: info,
    join: join,
    leave: leave,
    players: [],
    playerList: playerList,
    round: false,
    sendChatMessage: sendChatMessage,
    sendMessage: sendMessage,
    sendUpdate: sendUpdate,
  };

  game.whiteCards = new Stack();
  game.whiteDiscards = new Stack();
  game.blackCards = new Stack();
  game.blackDiscards = new Stack();

  return game;

  //////

  function init() {
    return db.getCardsFromDecks(gameOpts.decks)
    .then((result) => {
      game.whiteCards.add(result.whiteCards);
      game.blackCards.add(result.blackCards);
      game.whiteCards.shuffle();
      game.blackCards.shuffle();
      debug('Game initialized: ' + info());
      return true;
    });
  }

  function newRound() {
    pickCzar();
    game.round = new Round(game);
    io.to(id).emit('newRound', game.round.status());
  }

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

  function info() {
    return {
      id: game.id,
      name: game.name,
      czarTime: gameOpts.czarTime,
      playerLimit: gameOpts.playerLimit,
      playerCount: game.players.length,
      roundTime: gameOpts.roundTime,
      scoreLimit: gameOpts.scoreLimit
    };
  }

  function playerList() {
    var playerList = [];
    for (let p of game.players) {
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
      if (game.players.length === gameOpts.playerLimit) {
        reject('Game is full');
      }

      /* Setup new player and add to players array */
      var player = new Player(playerInfo);
      player.hand.add(game.whiteCards.draw(10));
      game.players.push(player);

      /* Update the round or create new round if not set */
      if (!game.round) {
        newRound();
      } else {
        game.round.update();
      }

      /* Send game info to player */
      io.to(player.socketId).emit('joinedGame', {
        round: game.round.status(),
        players: playerList()
      });
      io.to(player.socketId).emit('message', {
        text: 'Welcome to ' + game.name,
        type: 'info'
      });
      io.to(player.socketId).emit('hand', player.hand.get());

      /* Alert other clients */
      sendMessage(player.name + ' joined the game.');
      sendUpdate();

      resolve();
    });
  }

  function leave(playerId) {
    var index = util.findIndexByKeyValue(game.players, 'id', playerId);
    if (index >= 0) {
      /* Alert other clients */
      sendMessage(game.players[index].name + ' has left the game.');
      game.players.splice(index, 1);
      sendUpdate();
    }
    if (!game.players.length) {
      lobby.removeGame(id);
    }
  }

  function sendUpdate() {
    io.to(id).emit('updateGame', {
      round: game.round.status(),
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

}

module.exports = Game;
