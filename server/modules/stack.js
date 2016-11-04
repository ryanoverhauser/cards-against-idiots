'use strict';

var util = require('./util');

function Stack() {

  var items = [];

  function add(newItems) {
    items = items.concat(newItems);
  }

  function draw(count) {
    return items.splice(0, count);
  }

  function drawOne() {
    return items.shift();
  }

  function count() {
    return items.length;
  }

  function empty() {
    return items.splice(0);
  }

  function get() {
    return items;
  }

  function getById(id) {
    return util.findByKeyValue(items, 'id', id);
  }

  function getByKey(key, value) {
    return util.findByKeyValue(items, key, value);
  }

  function removeById(id) {
    var i = util.findIndexByKeyValue(items, 'id', id);
    if (i >= 0) {
      items.splice(i, 1);
    }
  }

  function removeByKey(key, value) {
    var i = util.findIndexByKeyValue(items, key, value);
    if (i >= 0) {
      items.splice(i, 1);
    }
  }

  function shuffle() {
    var theLength = items.length - 1;
    var toSwap;
    var tempCard;
    for (var i = theLength; i > 0; i--) {
      toSwap = Math.floor(Math.random() * i);
      tempCard = items[i];
      items[i] = items[toSwap];
      items[toSwap] = tempCard;
    }
  }

  return {
    add: add,
    get: get,
    getById: getById,
    getByKey: getByKey,
    count: count,
    draw: draw,
    drawOne: drawOne,
    empty: empty,
    removeById: removeById,
    removeByKey: removeByKey,
    shuffle: shuffle
  };

}

module.exports = Stack;
