'use strict';

var debug = require('debug')('game');
var Table = require('cli-table');

var cardcast = require('./cardcast')();
var db = require('./database');
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
    czarTime: gameOpts.czarTime,
    deal: deal,
    name: gameOpts.name,
    init: init,
    info: info,
    join: join,
    leave: leave,
    newRound: newRound,
    players: [],
    playerList: playerList,
    playerLimit: 8,
    round: false,
    roundTime: gameOpts.roundTime,
    scoreLimit: gameOpts.scoreLimit,
    reshuffleBlack: reshuffleBlack,
    reshuffleWhite: reshuffleWhite,
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

  function checkGame() {
    for (let player of game.players) {
      if (player.score >= game.scoreLimit) {
        player.wins += 1;
        sendMessage(player.name + ' wins the game!', 'warning');
        newGame();
        break;
      }
    }
  }

  function cardCount() {
    var table = new Table({
      head: ['','Draw Pile', 'Discards', 'In Play', 'Total'],
      colWidths: [15, 15, 15, 15, 15],
      colAligns: ['left', 'right', 'right', 'right', 'right']
    });

    var roundCount = (game.round) ? 1 : 0;
    var handCount = 0;
    for (let player of game.players) {
      handCount += player.hand.count();
    };

    table.push([
      'Black Cards',
      game.blackCards.count(),
      game.blackDiscards.count(),
      roundCount,
      game.blackCards.count() + game.blackDiscards.count() + roundCount
    ]);

    table.push([
      'White Cards',
      game.whiteCards.count(),
      game.whiteDiscards.count(),
      handCount,
      game.whiteCards.count() + game.whiteDiscards.count() + handCount
    ]);

    table.push([
      'Totals',
      game.blackCards.count() + game.whiteCards.count(),
      game.blackDiscards.count() + game.whiteDiscards.count(),
      roundCount + handCount,
      game.blackCards.count() + game.blackDiscards.count() + roundCount +
      game.whiteCards.count() + game.whiteDiscards.count() + handCount
    ]);

    debug(game.name + ' Card Count:\n' + table.toString());
  }

  function deal() {
    for (let player of game.players) {
      var count = 10 - player.hand.count();
      if (!player.czar) {
        count += game.round.prompt.draw
      }
      if (count > game.whiteCards.count()) {
        reshuffleWhite();
      }
      if (count) {
        player.hand.add(game.whiteCards.draw(count));
      }
      io.to(player.socketId).emit('hand', player.hand.get());
    };
  }

  function getCustomDecks() {
    return Promise.all(
      gameOpts.customDecks.map(cardcast.getDeckCards)
    )
    .then((decks) => {
      decks.forEach(function(deck) {
        game.whiteCards.add(deck.whiteCards);
        game.blackCards.add(deck.blackCards);
      })
    })
    .catch((err) => {
      debug('Error loading custom decks: ' + err);
    });
  }

  function getDecks() {
    return db.getCardsFromDecks(gameOpts.decks)
    .then((decks) => {
      game.whiteCards.add(decks.whiteCards);
      game.blackCards.add(decks.blackCards);
    })
    .catch((err) => {
      debug('Error loading decks: ' + err);
    });
  }

  function init() {
    return getDecks()
    .then(getCustomDecks)
    .then(() => {
      game.whiteCards.shuffle();
      game.blackCards.shuffle();
      debug('Game initialized: ' + info());
      cardCount();
    });
  }

  function info() {
    return {
      id: game.id,
      name: game.name,
      czarTime: gameOpts.czarTime,
      playerLimit: game.playerLimit,
      playerCount: game.players.length,
      roundTime: gameOpts.roundTime,
      scoreLimit: gameOpts.scoreLimit
    };
  }

  function join(playerInfo) {
    return new Promise((resolve, reject) => {

      /* Check that game is not full */
      if (game.players.length >= gameOpts.playerLimit) {
        reject('Game is full');
      }

      /* Setup new player and add to players array */
      var player = new Player(playerInfo);
      game.players.push(player);

      /* Update the round or create new round if not set */
      if (!game.round) {
        newRound();
      } else {
        /* Mark player as answered if the round is closed */
        if (game.round.status().state === 'closed') {
          player.answered = true;
        }
        game.round.update();
      }

      /* Send game info to player */
      io.to(player.socketId).emit('joinedGame', {
        round: game.round.status(),
        players: playerList()
      });
      io.to(player.socketId).emit('message', {
        text: 'Welcome to ' + game.name + '!',
        type: 'info'
      });
      deal();

      /* Alert other clients */
      sendMessage(player.name + ' joined the game.');
      sendUpdate();

      cardCount();

      resolve();
    });
  }

  function leave(playerId) {
    var index = util.findIndexByKeyValue(game.players, 'id', playerId);
    if (index >= 0) {
      /* Alert other clients */
      sendMessage(game.players[index].name + ' has left the game.');
      /* Remove player answer if exists */
      game.round.removePlayerAnswer(playerId)
      /* Discard hand */
      game.whiteDiscards.add(game.players[index].hand.empty());
      game.players.splice(index, 1);
      game.round.update();
      sendUpdate();
      cardCount();
    }
    /* Remove game if empty */
    if (!game.players.length) {
      lobby.removeGame(id);
    }
  }

  function newGame() {
    sendMessage('Starting new game...', 'info');
    // discard all hand cards and reset points
    for (let player of game.players) {
      player.score = 0;
      game.whiteDiscards.add(player.hand.empty());
    }
    reshuffleWhite();
  }

  function newRound() {
    checkGame();
    delete game.round;
    game.round = new Round(game);
    game.round.update();
    deal();
    io.to(id).emit('newRound', {
      round: game.round.status(),
      players: playerList()
    });
    cardCount();
  }

  function playerList() {
    var playerList = [];
    for (let p of game.players) {
      playerList.push({
        answered: p.answered,
        id: p.id,
        name: p.name,
        score: p.score,
        wins: p.wins,
        czar: p.czar,
      });
    }
    return playerList;
  }

  function reshuffleWhite() {
    game.whiteCards.add(game.whiteDiscards.empty());
    game.whiteCards.shuffle;
  }

  function reshuffleBlack() {
    game.blackCards.add(game.blackDiscards.empty());
    game.blackCards.shuffle;
  }

  function sendChatMessage(username, text) {
    io.to(id).emit('message', {
      text: text,
      type: 'chat',
      user: username
    });
  }

  function sendMessage(text, type) {
    type = type || 'update';
    io.to(id).emit('message', {
      text: text,
      type: type
    });
  }

  function sendUpdate() {
    io.to(id).emit('updateGame', {
      round: game.round.status(),
      players: playerList()
    });
  }

}

module.exports = Game;
