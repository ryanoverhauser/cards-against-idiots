'use strict';

var fs = require('fs');
var debug = require('debug')('cache');

function Cache() {

  var base = __dirname + '/../cache/';
  var cacheTime = (process.env.CACHE_TIME) ? parseInt(process.env.CACHE_TIME) : 1800;

  function clear() {
    fs.readdir(base, (err, files) => {
      // Ignore dot files and directories
      var filtered = files.filter(function(file) {
        var filePath = base + file;
        return fs.lstatSync(filePath).isFile() && file.charAt(0) !== '.';
      });
      filtered.forEach(function(file) {
        var filePath = base + file;
        fs.unlink(filePath);
      });
    });
  }

  function get(key) {
    var filePath = base + key;
    return validate(filePath).then(readFile);
  }

  function put(key, value) {
    return new Promise((resolve, reject) => {
      var filePath = base + key;
      fs.writeFile(filePath, value, function(err) {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  function readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', function(err, data) {
        if (!err) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }

  function validate(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, function(err, data) {
        if (!err) {
          var now = new Date();
          var mtime = new Date(data.mtime);
          var age = (now - mtime) / 1000;
          debug(age);
          if (age < cacheTime) {
            resolve(filePath);
          } else {
            reject('Cache object expired');
          }
        } else {
          reject(err);
        }
      });
    });
  }

  return {
    clear: clear,
    get: get,
    put: put
  }

}

module.exports = Cache;
