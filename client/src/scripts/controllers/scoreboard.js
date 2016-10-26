(function() {
  'use strict';

  angular
    .module('cati')
    .controller('ScoreboardController', ScoreboardController);

  ScoreboardController.$inject = ['socket'];

  function ScoreboardController(socket) {

    var $ctrl = this;

    $ctrl.scoreboard = [];

    socket.on('joinedGame', onJoinedGame);

    function onJoinedGame(data) {
      $ctrl.scoreboard = data.scoreboard;
    }

  }

})();
