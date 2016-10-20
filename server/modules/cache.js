'use strict';

var fs = require('fs');

function Cache() {

  var base = __dirname + '/../cache/';

  return {

    put: function(id, contents, callback) {
      var filePath = base + id;
      fs.writeFile(filePath, contents, function(err) {
        callback(err);
      });
    },

    get: function(id, callback) {
      var filePath = base + id;
      fs.readFile(filePath, 'utf8', function(err, data) {
        callback(err, data);
      }); 
    }

  }

}

module.exports = Cache;
