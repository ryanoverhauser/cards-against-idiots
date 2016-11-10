(function() {
  'use strict';

  angular
    .module('cati')
    .factory('players', players);

  players.$inject = ['socket'];

  function players(socket) {

    var observerCallbacks = [];
    var service = {
      playerList: [],
      registerObserver: registerObserver
    };

    socket.on('joinedGame', update);
    socket.on('updateGame', update);
    socket.on('newRound', update);

    return service;

    //////

    function notifyObservers() {
      angular.forEach(observerCallbacks, function(callback) {
        callback();
      });
    }

    function registerObserver(callback) {
      observerCallbacks.push(callback);
    }

    function update(data) {
      service.playerList = data.players;
      notifyObservers();
    }

  }

})();
