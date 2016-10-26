(function() {
  'use strict';

  angular
    .module('cati')
    .factory('util', util);

  function util () {

    var service = {
      findByKeyValue: findByKeyValue,
      findIndexByKeyValue: findIndexByKeyValue
    };

    return service;

    //////

    function findByKeyValue (source, key, value) {
      return source.filter(function(obj) {
        return obj[key] === value;
      })[ 0 ];
    }

    function findIndexByKeyValue(source, key, value) {
      for (var i = 0; i < source.length; i++) {
        if (source[i][key] === value) {
          return i;
        }
      }
      return -1;
    }

  }

})();

