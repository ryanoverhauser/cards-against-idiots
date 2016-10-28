(function() {
  'use strict';

  angular
    .module('cati')
    .controller('GameController', GameController);

  GameController.$inject = ['$uibModal', 'players', 'socket', 'user', 'util'];

  function GameController($uibModal, players, socket, user, util) {

    var $ctrl = this;

    $ctrl.answered = false;
    $ctrl.clearCards = clearCards;
    $ctrl.czar = false;
    $ctrl.hand = {};
    $ctrl.isActive = isActive;
    $ctrl.isClosed = isClosed;
    $ctrl.isOpen = isOpen;
    $ctrl.isWaiting = isWaiting;
    $ctrl.pickWinner = pickWinner;
    $ctrl.placeCard = placeCard;
    $ctrl.playerList = [];
    $ctrl.playSlots = [];
    $ctrl.round = false;
    $ctrl.submitAnswer = submitAnswer;

    // Listen for updates to the player list
    players.registerObserver(updatePlayers);

    function cleanCard(card) {
      var cleaned = angular.copy(card);
      delete cleaned.disabled;
      return cleaned;
    }

    function clearCards() {
      for (var i = 0; i < $ctrl.playSlots.length; i++) {
        if ($ctrl.playSlots[i].card) {
          $ctrl.playSlots[i].card.disabled = false;
          $ctrl.playSlots[i].card = false;
        }
      }
    }

    function czarCheck() {
      var czar = util.findByKeyValue($ctrl.playerList, 'czar', true);
      if (czar && czar.id === user.id) {
        $ctrl.czar = true;
      } else {
        $ctrl.czar = false;
      }
    }

    function isActive() {
      return $ctrl.round.state !== 'waiting';
    }

    function isClosed() {
      return $ctrl.round.state === 'closed';
    }

    function isOpen() {
      return $ctrl.round.state === 'open';
    }

    function isWaiting() {
      return $ctrl.round.state === 'waiting';
    }

    function pickWinner(answer) {
      if ($ctrl.czar) {
        socket.emit('pickWinner', answer);
      }
    }

    function placeCard(slot, card) {
      if (!card.disabled && !$ctrl.answered) {
        if (slot.card) {
          slot.card.disabled = false;
        }
        slot.card = card;
        card.disabled = true;
      }
    }

    function playSlotsFilled() {
      for (var i = 0; i < $ctrl.playSlots.length; i++) {
        if (!$ctrl.playSlots.card) {
          return false;
        }
      }
      return true;
    }

    function setupRound() {
      czarCheck();
      $ctrl.answered = false;
      $ctrl.playSlots = [];
      for (var i = 0; i < $ctrl.round.prompt.pick; i++) {
        $ctrl.playSlots.push({
          id: i,
          card: false
        });
      }
    }

    function submitAnswer() {
      var answer = $ctrl.playSlots.map(function(s) {
        return cleanCard(s.card);
      });
      console.log('submitAnswer', answer);
      socket.emit('submitAnswer', answer);
      $ctrl.answered = true;
    }

    function updatePlayers() {
      $ctrl.playerList = players.playerList;
      czarCheck();
    }

    socket.on('hand', onHand);
    socket.on('joinedGame', onJoinedGame);
    socket.on('newRound', onNewRound);
    socket.on('updateGame', onUpdateGame);
    socket.on('roundEnded', onRoundEnded);

    function onHand(data) {
      // console.log('hand', data);
      $ctrl.hand = data;
    }

    function onJoinedGame(data) {
      console.log('joinedGame', data);
      $ctrl.round = data.round;
      setupRound();
    }

    function onNewRound(data) {
      console.log('newRound', data);
      $ctrl.round = data.round;
      setupRound();
    }

    function onRoundEnded(data) {
      console.log('onRoundEnded', data);
    }

    function onUpdateGame(data) {
      console.log('updateGame', data);
      $ctrl.round = data.round;
    }

  }

})();
