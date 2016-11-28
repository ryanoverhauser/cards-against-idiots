'use strict';

var debug = require('debug')('db');
var fs = require('fs');
var uuid = require('uuid');

var dir = __dirname + '/../../decks/';
var cards = require('./cards');
var util = require('./util');
var BlackCard = cards.blackCard;
var WhiteCard = cards.whiteCard;

function DbFile() {

  var decks = [];
  var filenames = fs.readdirSync(dir);
  for (let file of filenames) {
    if (file.substring(0, 1) === '.') {
      continue;
    }
    var filePath = dir + file;
    var deck = buildDeck(filePath);
    if (deck) {
      decks.push(deck);
    }
  }

  function buildDeck(filePath) {
    try {
      var deckJSON = JSON.parse(fs.readFileSync(filePath));
    } catch (e) {
      debug('Failed to parse JSON: ' + filePath);
      return false;
    }
    var deck = {
      id: uuid(),
      name: deckJSON.name,
      whiteCards: [],
      blackCards: []
    };
    for (let card of deckJSON.whiteCards) {
      var id = uuid();
      var cardObj = new WhiteCard(id, card.text);
      deck.whiteCards.push(cardObj);
    }
    for (let card of deckJSON.blackCards) {
      var id = uuid();
      var cardObj = new BlackCard(id, card.text, parseInt(card.draw), parseInt(card.pick));
      deck.blackCards.push(cardObj);
    }
    return deck;
  }

  function getDecks() {
    return new Promise((resolve, reject) => {
      var deckArray = [];
      for (let deck of decks) {
        deckArray.push({
          id: deck.id,
          name: deck.name,
          blackCardCount: deck.blackCards.length,
          whiteCardCount: deck.whiteCards.length
        });
      }
      resolve(deckArray);
    });
  }

  function getCardsFromDecks(deckIds) {
    return new Promise((resolve, reject) => {
      var blackCards = [];
      var whiteCards = [];
      for (let id of deckIds) {
        var deck = util.findByKeyValue(decks, 'id', id);
        if (deck) {
          whiteCards = whiteCards.concat(deck.whiteCards);
          blackCards = blackCards.concat(deck.blackCards);
        }
      }
      resolve({
        blackCards: blackCards,
        whiteCards: whiteCards
      });
    });
  }

  return {
    getCardsFromDecks: getCardsFromDecks,
    getDecks: getDecks
  }

}

module.exports = DbFile;
