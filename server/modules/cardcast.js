'use strict';

var debug = require('debug')('cardcast');
var https = require('https');
var StringDecoder = require('string_decoder').StringDecoder;

var cache = require('./cache')();
var cards = require('./cards');
var BlackCard = cards.blackCard;
var WhiteCard = cards.whiteCard;

function Cardcast() {

  function getJSON(url) {
    return new Promise((resolve, reject) => {
      https.get(url, function(res) {
        var content = '';
        res.on('data', function(data) {
          content += data;
        });
        res.on('end', function () {
          var decoder = new StringDecoder('utf8');
          resolve(JSON.parse(decoder.write(content)));
        });
      }).on('error', function(e) {
        reject('Cardcast error: ' + e.message);
      });
    });
  }

  function fetchDeck(deckId) {
    debug('fetchDeck');
    var url = 'https://api.cardcastgame.com/v1/decks/' + deckId;
    var key = deckId + '_cc_deck';
    return getJSON(url)
    .then((data) => {
      cache.put(key, JSON.stringify(data));
      return data;
    });
  }

  function fetchDeckCards(deckId, callback) {
    debug('fetchDeckCards');
    var url = 'https://api.cardcastgame.com/v1/decks/' + deckId + '/cards';
    var key = deckId + '_cc_cards';
    return getJSON(url)
    .then((data) => {
      var cards = parseCards(data);
      cache.put(key, JSON.stringify(cards));
      return cards;
    });
  }

  function fetchDeckFromCache(deckId) {
    debug('fetchDeckFromCache');
    var key = deckId + '_cc_deck';
    return new Promise((resolve, reject) => {
      cache.get(key)
      .then((data) => {
        resolve(JSON.parse(data));
      })
      .catch((err) => {
        debug(err);
        resolve(fetchDeck(deckId));
      });
    });
  }

  function fetchDeckCardsFromCache(deckId) {
    debug('fetchDeckCardsFromCache');
    var key = deckId + '_cc_cards';
    return new Promise((resolve, reject) => {
      cache.get(key)
      .then((data) => {
        resolve(JSON.parse(data));
      })
      .catch((err) => {
        debug(err);
        resolve(fetchDeckCards(deckId));
      });
    });
  }

  function parseCards(data) {
    // debug(data);
    var cards = {
      blackCards: [],
      whiteCards: []
    }

    // Parse black cards
    data.calls.forEach(function(call) {
      var text = concatText(call.text)
      var draw = (call.text.length >= 3) ? 2 : 0;
      var pick = call.text.length - 1;
      var card = new BlackCard(call.id, text, draw, pick);
      cards.blackCards.push(card);
    })

    // Parse white cards
    data.responses.forEach(function(response) {
      var card = new WhiteCard(
        response.id,
        response.text[0]
      );
      cards.whiteCards.push(card);
    });

    return cards;
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
    getDeck: fetchDeckFromCache,
    getDeckCards: fetchDeckCardsFromCache
  }

}

module.exports = Cardcast;
