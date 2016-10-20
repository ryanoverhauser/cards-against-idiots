'use strict';

class Util {

  static findByKeyValue(source, key, value) {
    return source.filter(function(obj) {
      return obj[key] === value;
    })[ 0 ];
  }

  static generateUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + s4() + s4();
  };

  static exists(data) {
    return (typeof(data) !== 'undefined' && data !== null) ? true : false;
  }

};

module.exports = Util;
