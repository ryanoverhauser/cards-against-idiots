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
      console.log('Message', data);
      $ctrl.messages.push(data);
    }

    function sendMessage() {
      // // emit events via the chat console for dev purposes
      // if ($ctrl.input.msg.substring(0,2) === '//') {
      //   socket.emit($ctrl.input.msg.substring(2));
      // } else {
      //   socket.emit('message', {message: $ctrl.input.msg});
      // }
      socket.emit('message', {message: $ctrl.input.msg});
      $ctrl.input.msg = '';
    }

  }

})();
