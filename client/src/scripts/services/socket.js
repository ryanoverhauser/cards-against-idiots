(function() {
  'use strict';

  angular
    .module('cati')
    .factory('socket', socket);

  socket.$inject = ['$rootScope'];

  function socket($rootScope) {
    var socket = io();
    var service = {
      emit: emit,
      on: on,
      socket: socket
    };

    return service;

    /////

    function on (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    }

    function emit (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }

  }

})();

