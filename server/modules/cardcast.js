'use strict';

var debug = require('debug')('cardcast');
var https = require('https');
var StringDecoder = require('string_decoder').StringDecoder;

var cache = require('./cache')();

function Cardcast() {

  function fetchDeck(deckId, callback) {
    var url = 'https://api.cardcastgame.com/v1/decks/' + deckId;
    https.get(url, function(res) {
      var content = '';
      res.on('data', function(data) {
        content += data;
      });
      res.on('end', function () {
        debug(content);
        var decoder = new StringDecoder('utf8');
        callback(decoder.write(content));
      });
    }).on('error', function(e) {
      debug('Got error: ' + e.message);
    });
  }

  function fetchDeckCards(deckId, callback) {
    var url = 'https://api.cardcastgame.com/v1/decks/' + deckId + '/cards';
    https.get(url, function(res) {
      var content = '';
      res.on('data', function(data) {
        content += data;
      });
      res.on('end', function () {
        var decoder = new StringDecoder('utf8');
        callback(decoder.write(content));
      });
    }).on('error', function(e) {
      debug('Got error: ' + e.message);
    });
  }

  function parseCards(data) {
    var res = {
      black: [],
      white: []
    }
    for (var i = 0; i < data.calls.length; i++) {
      var draw = (data.calls[i].text.length >= 3) ? 2 : 0;
      var card = {
        id: data.calls[i].id,
        text: concatText(data.calls[i].text),
        pick: (data.calls[i].text.length - 1),
        draw: draw
      }
      res.black.push(card);
    }
    for (var i = 0; i < data.responses.length; i++) {
      var card = {
        id: data.responses[i].id,
        text: data.responses[i].text[0]
      };
      res.white.push(card);
    }
    return res;
  }

  function concatText(segments) {
    var text = '';
    for (var i = 0; i < segments.length; i++) {
      if (i > 0) { text += '____'; }
      text += segments[i];
    }
    return text;
  }

  return {

    getDeck: function(deckId, callback) {
      var key = deckId + '_cc_deck';
      cache.get(key, function(err, data) {
        if (err) {
          fetchDeck(deckId, function(data) {
            cache.put(key, data, function(err) {
              if (err) { debug(err) };
            });
            callback(JSON.parse(data));
          });
        } else {
          callback(JSON.parse(data));
        }
      });
    },
    getDeckCards: function(deckId, callback) {
      var key = deckId + '_cc_cards';
      cache.get(key, function(err, data) {
        if (err) {
          fetchDeckCards(deckId, function(data) {
            cache.put(key, data, function(err) {
              if (err) { debug(err) };
            });
            callback(parseCards(JSON.parse(data)));
          });
        } else {
          callback(parseCards(JSON.parse(data)));
        }
      });
    }

  }

}

module.exports = Cardcast;
