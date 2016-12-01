'use strict';

var debug = require('debug')('db');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID

var cards = require('./cards');
var util = require('./util');
var BlackCard = cards.blackCard;
var WhiteCard = cards.whiteCard;

function DbMongo() {

  // Connection URL
  var url = 'mongodb://';
  url += (process.env.DB_HOST || 'localhost');
  url += ':' + (process.env.DB_PORT || '27017');
  url += '/' + process.env.DB_NAME;

  function getDecks() {
    var db;
    return loadDecks()
    .then((decks) => {
      var promises = [];
      for (let deck of decks) {
        deck.id = deck._id;
        promises.push(countDeckCards(deck));
      }
      return Promise.all(promises);
    });
  }

  function loadDecks(db) {
    return MongoClient.connect(url)
    .then((db) => {
      return db.collection('decks').find({}).toArray()
      .then((result) => {
        db.close();
        return result;
      });
    });
  }

  function countDeckCards(deck) {
    return MongoClient.connect(url)
    .then((db) => {
      return Promise.all([
        db.collection('whiteCards').count({'deckId': deck._id}),
        db.collection('blackCards').count({'deckId': deck._id}),
      ])
      .then((result) => {
        deck.whiteCardCount = result[0];
        deck.blackCardCount = result[1];
        db.close();
        return deck;
      });
    });
  }

  function getCardsFromDecks(deckIds) {
    return Promise.all([
      getWhiteCards(deckIds),
      getBlackCards(deckIds)
    ]).then((result) => {
      return {
        whiteCards: parseWhiteCards(result[0]),
        blackCards: parseBlackCards(result[1])
      }
    });
  }

  function getBlackCards(deckIds) {
    return MongoClient.connect(url)
    .then((db) => {
      var ors = [];
      for (let id of deckIds) {
        ors.push({'deckId' : ObjectID(id)});
      };
      return db.collection('blackCards').find({$or: ors}).toArray();
    });
  }

  function getWhiteCards(deckIds) {
    return MongoClient.connect(url)
    .then((db) => {
      var ors = [];
      for (let id of deckIds) {
        ors.push({'deckId' : ObjectID(id)});
      };
      return db.collection('whiteCards').find({$or: ors}).toArray();
    });
  }

  function parseBlackCards(rows) {
    var cards = [];
    for (let r of rows) {
      var card = new BlackCard(r._id, r.text, r.draw, r.pick);
      cards.push(card);
    }
    return cards;
  }

  function parseWhiteCards(rows) {
    var cards = [];
    for (let r of rows) {
      var card = new WhiteCard(r._id, r.text);
      cards.push(card);
    }
    return cards;
  }

  return {
    getCardsFromDecks: getCardsFromDecks,
    getDecks: getDecks
  }

}

module.exports = DbMongo;
