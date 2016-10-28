'use strict';

var util = require('./util');

function Stack() {

  var cards = [];

  function add(items) {
    cards = cards.concat(items);
  }

  function draw(count) {
    return cards.splice(0, count);
  }

  function drawOne() {
    return cards.shift();
  }

  function count() {
    return cards.length;
  }

  function empty() {
    return cards.splice(0);
  }

  function get() {
    return cards;
  }

  function getById(id) {
    return util.findByKeyValue(cards, 'id', id);
  }

  function removeById(id) {
    var i = util.findIndexByKeyValue(cards, 'id', id);
    if (i >= 0) {
      cards.splice(i, 1);
    }
  }

  function shuffle() {
    var theLength = cards.length - 1;
    var toSwap;
    var tempCard;
    for (var i = theLength; i > 0; i--) {
      toSwap = Math.floor(Math.random() * i);
      tempCard = cards[i];
      cards[i] = cards[toSwap];
      cards[toSwap] = tempCard;
    }
  }

  return {
    add: add,
    get: get,
    getById: getById,
    count: count,
    draw: draw,
    drawOne: drawOne,
    empty: empty,
    removeById: removeById,
    shuffle: shuffle
  };

}

module.exports = Stack;
