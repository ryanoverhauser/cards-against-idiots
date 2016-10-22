'use strict';

class Util {

  static exists(data) {
    return (typeof(data) !== 'undefined' && data !== null) ? true : false;
  }

  static findByKeyValue(source, key, value) {
    return source.filter(function(obj) {
      return obj[key] === value;
    })[ 0 ];
  }

  static findIndexByKeyValue(source, key, value) {
    for (var i = 0; i < source.length; i++) {
      if (source[i][key] == value) {
        return i;
      }
    }
    return -1;
  }

  static generateUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + s4() + s4();
  };

};

module.exports = Util;
