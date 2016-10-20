(function(){
  'use strict';

  angular
    .module('cati')
    .factory('util', util);

  function util (){
    var service = {
      findByKeyValue: findByKeyValue
    };

    return service;

    //////

    function findByKeyValue ( source, key, value ) {
      return source.filter(function( obj ) {
        return obj[key] === value;
      })[ 0 ];
    }

  }

})();

