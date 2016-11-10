(function() {
  'use strict';

  angular
    .module('cati')
    .controller('LobbyController', LobbyController);

  LobbyController.$inject = ['$uibModal', 'socket', 'user'];

  function LobbyController($uibModal, socket, user) {

    var $ctrl = this;

    $ctrl.createGame = createGame;
    $ctrl.decks = [];
    $ctrl.games = [];
    $ctrl.joinGame = joinGame;
    $ctrl.refreshGamesList = refreshGamesList;

    socket.on('initialized', function (data) {
      $ctrl.games = data.games;
      $ctrl.decks = data.decks;

      // // Auto join/create - For testing only
      // if ($ctrl.games.length) {
      //   joinGame($ctrl.games[0].id);
      // } else {
      //   socket.emit('createGame', {
      //     name: 'foobar\'s game',
      //     decks: [3,4],
      //     customDecks: [],
      //     scoreLimit: 10,
      //     roundTime: 120,
      //     playerLimit: 8,
      //     czarTime: 120
      //   });
      // }

    });

    socket.on('updateLobby', function (data) {
      $ctrl.games = data.games;
      $ctrl.decks = data.decks;
    });

    //////

    function createGame() {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/create',
        controller: 'CreateGameModalController as create',
        size: 'lg',
        resolve: {
          decks: function () {
            return $ctrl.decks;
          }
        }
      });

      modalInstance.result.then(function (options) {
        var gameOpts = {
          name: options.name,
          decks: options.decks,
          customDecks: options.customDecks,
          scoreLimit: options.scoreLimit.value,
          roundTime: options.roundTime.value,
          czarTime: options.czarTime.value
        };
        socket.emit('createGame', gameOpts);
      }, function () {
        //
      });
    }

    function joinGame(gameId) {
      socket.emit('joinGame', {gameId: gameId});
    }

    function refreshGamesList() {
      socket.emit('refreshLobby');
    }

  }

})();

