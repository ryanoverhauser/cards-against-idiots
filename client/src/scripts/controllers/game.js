(function() {
  'use strict';

  angular
    .module('cati')
    .controller('GameController', GameController);

  GameController.$inject = ['$uibModal', 'socket', 'user'];

  function GameController($uibModal, socket, user) {

    var $ctrl = this;

    $ctrl.hand = {};
    $ctrl.round = {};
    $ctrl.placeCard = placeCard;
    $ctrl.playSlots = [];

    socket.on('joinedGame', onJoinedGame);
    socket.on('hand', onHand);
    socket.on('newRound', onNewRound);
    socket.on('roundStatus', onRoundStatus);

    function setupRound() {
      for (var i = 0; i < $ctrl.round.prompt.pick; i++) {
        $ctrl.playSlots.push({
          id: i,
          card: false
        });
      }
    }

    function placeCard(slot, card) {
      if (!card.disabled) {
        if (slot.card) {
          slot.card.disabled = false;
        }
        slot.card = card;
        card.disabled = true;
      }
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

    function onRoundStatus(data) {
      console.log('roundStatus', data);
      $ctrl.round = data;
    }

    function onHand(data) {
      console.log('hand', data);
      $ctrl.hand = data;
    }

  }

})();
