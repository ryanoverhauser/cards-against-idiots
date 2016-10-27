(function() {
  'use strict';

  angular
    .module('cati')
    .controller('GameController', GameController);

  GameController.$inject = ['$uibModal', 'players', 'socket', 'user', 'util'];

  function GameController($uibModal, players, socket, user, util) {

    var $ctrl = this;

    $ctrl.answered = false;
    $ctrl.czar = false;
    $ctrl.hand = {};
    $ctrl.isActive = isActive;
    $ctrl.round = false;
    $ctrl.clearCards = clearCards;
    $ctrl.placeCard = placeCard;
    $ctrl.playerList = [];
    $ctrl.playSlots = [];
    $ctrl.submitAnswer = submitAnswer;

    players.registerObserver(updatePlayers);

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
      console.log('isActive', $ctrl.round.state);
      return $ctrl.round.state !== 'waiting';
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
      var answer = $ctrl.playSlots.map(function(s) {return s.card;});
      socket.emit('submitAnswer', angular.copy(answer));
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
      $ctrl.round = data;
      setupRound();
    }
    function onUpdateGame(data) {
      console.log('updateGame', data);
      $ctrl.round = data.round;
    }

  }

})();
