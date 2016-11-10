(function() {
  'use strict';

  angular
    .module('cati')
    .controller('ConsoleController', ConsoleController);

  ConsoleController.$inject = ['socket', 'user'];

  function ConsoleController(socket, user) {

    var $ctrl = this;

    $ctrl.messages = [];
    $ctrl.sendMessage = sendMessage;

    socket.on('joinedGame', onJoinedGame);
    socket.on('message', onMessage);

    function onJoinedGame(data) {
      $ctrl.messages = [];
    }

    function onMessage(data) {
      $ctrl.messages.push(data);
    }

    function sendMessage() {
      var msg = $ctrl.input.msg;
      if (msg && msg.trim() !== '') {
        socket.emit('message', {message: msg.trim()});
      }
      $ctrl.input.msg = '';
    }

  }

})();
