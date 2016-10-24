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
    });
    socket.on('updateLobby', function (data) {
      console.log('updateLobby', data);
      $ctrl.games = data.games;
      $ctrl.decks = data.decks;
    });
    socket.on('leftGame', function (data) {
      console.log('leftGame', data);
      $ctrl.games = data.games;
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
        console.log(gameOpts);
        socket.emit('createGame', gameOpts);
        // console.log('createGame', gameOpts);
      }, function () {
        // console.log('Modal dismissed at: ' + new Date());
      });
    }

    function joinGame(gameId) {
      socket.emit('joinGame', {gameId: gameId});
    }

    function refreshGamesList() {
      socket.emit('getGames');
    }

  }

})();

