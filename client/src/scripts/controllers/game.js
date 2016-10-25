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
    $ctrl.scoreboard = [];
    $ctrl.leave = leaveGame;
    $ctrl.messages = [];

    socket.on('joinedGame', onJoinedGame);
    socket.on('hand', onHand);
    socket.on('message', onMessage);
    socket.on('newRound', onNewRound);
    socket.on('roundStatus', onRoundStatus);

    function onJoinedGame(data) {
      console.log('joinedGame', data);
      $ctrl.round = data.round;
      $ctrl.scoreboard = data.scoreboard;
    }

    function onMessage(data) {
      console.log('Message', data);
    }

    function onNewRound(data) {
      console.log('newRound', data);
      $ctrl.round = data;
    }

    function onRoundStatus(data) {
      console.log('roundStatus', data);
      $ctrl.round = data;
    }

    function onHand(data) {
      console.log('hand', data);
      $ctrl.hand = data;
    }

    function leaveGame() {
      socket.emit('leaveGame');
    }

  }

})();
