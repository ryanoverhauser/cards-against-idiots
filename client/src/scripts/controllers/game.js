(function() {
  'use strict';

  angular
    .module('cati')
    .controller('GameController', GameController);

  GameController.$inject = ['$uibModal', 'socket', 'user'];

  function GameController($uibModal, socket, user) {

    var $ctrl = this;

    $ctrl.leave = leaveGame;
    $ctrl.messages = [];

    socket.on('message', onMessage);

    function onMessage(data) {
      console.log('Message', data);
    }

    function leaveGame() {
      socket.emit('leaveGame');
    }

  }

})();
