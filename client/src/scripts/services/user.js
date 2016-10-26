(function() {
  'use strict';

  angular
    .module('cati')
    .factory('user', user);

  function user() {

    var service = {
      id: null,
      init: init,
      name: null,
      initialized: false,
      getUser: getUser
    };

    return service;

    //////

    function getUser() {
      return {
        id: service.id,
        name: service.name,
        initialized: service.initialized
      };
    }

    function init(id, name) {
      service.id = id;
      service.name = name;
      service.initialized = true;
      return user;
    }

  }

})();

