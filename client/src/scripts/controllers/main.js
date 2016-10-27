(function() {
  'use strict';

  angular
    .module('cati')
    .controller('MainController', MainController);

  MainController.$inject = ['socket', 'user'];

  function MainController(socket, user) {

    var $ctrl = this;

    $ctrl.addAlert = addAlert;
    $ctrl.alerts = [];
    $ctrl.closeAlert = closeAlert;
    $ctrl.inGame = false;
    $ctrl.init = init;
    $ctrl.initialized = false;
    $ctrl.leaveGame = leaveGame;

    // socket.emit('init', {name: 'foobar'});
    // socket.on('initialized', function () {
    //   socket.emit('createGame', {
    //     name: 'foobar\'s game',
    //     decks: [3,4],
    //     customDecks: [],
    //     scoreLimit: 10,
    //     roundTime: 120,
    //     playerLimit: 8,
    //     czarTime: 120
    //   });
    // });

    socket.on('alert', function(data) {
      addAlert(data);
    });

    socket.on('disconnect', function() {

    });

    socket.on('reconnect', function() {

    });

    socket.on('initialized', function (data) {
      user.init(data.userId, data.userName);
      $ctrl.initialized = true;
      console.log('user initialized', user.getUser());
      // console.log('games', data.games);
      // console.log('decks', data.decks);
    });

    socket.on('joinedGame', function (data) {
      $ctrl.inGame = true;
    });

    socket.on('leftGame', function () {
      $ctrl.inGame = false;
      console.log('Left Game');
    });

    //////

    function addAlert(alert) {
      $ctrl.alerts.push({
        type: alert.type || 'warning',
        msg: alert.msg
      });
    }

    function closeAlert(index) {
      $ctrl.alerts.splice(index, 1);
    }

    function init() {
      if ($ctrl.user.$valid) {
        socket.emit('init', {name: $ctrl.user.name});
      }
    }

    function leaveGame() {
      socket.emit('leaveGame');
    }

  }

})();
