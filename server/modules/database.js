'use strict';

var debug = require('debug')('database');
var mysql = require('mysql');

function BlackCard(id, text, draw, pick) {
  this.id = id;
  this.text = text;
  this.draw = draw;
  this.pick = pick;
  this.toString = () => {
    return text;
  };
}

function WhiteCard(id, text) {
  this.id = id;
  this.text = text;
  this.toString = () => {
    return text;
  };
}

function Database() {

  function getDecks() {
    var queryString = 'SELECT id, name, ' +
      '( SELECT COUNT(white_cards.id) ' +
        'FROM white_cards ' +
        'WHERE white_cards.deck_id = card_decks.id ' +
      ') as white_card_count, ' +
      '( SELECT COUNT(black_cards.id) ' +
        'FROM black_cards ' +
        'WHERE black_cards.deck_id = card_decks.id ' +
      ') as black_card_count ' +
      'FROM card_decks';
    return runQuery(queryString);
  }

  function getAllCards() {
    var queryStringWhite = 'SELECT id, text FROM white_cards';
    var queryStringBlack = 'SELECT id, text, draw, pick FROM black_cards';

    return Promise.all([
      runQuery(queryStringWhite),
      runQuery(queryStringBlack)
    ]).then((result) => {
      return {
        whiteCards: parseWhiteCards(result[0]),
        blackCards: parseBlackCards(result[1])
      };
    });
  }

  function getActiveCards() {
    var queryStringWite = 'SELECT white_cards.id, white_cards.text ' +
      'FROM white_cards ' +
      'INNER JOIN card_decks ' +
      'ON white_cards.deck_id = card_decks.id ' +
      'WHERE white_cards.active = 1 ' +
      'AND card_decks.active = 1';
    var queryStringBlack = 'SELECT black_cards.id, black_cards.text, ' +
      'black_cards.draw, black_cards.pick ' +
      'FROM black_cards ' +
      'INNER JOIN card_decks ' +
      'ON black_cards.deck_id = card_decks.id ' +
      'WHERE black_cards.active = 1 ' +
      'AND card_decks.active = 1';

    return Promise.all([
      runQuery(queryStringWhite),
      runQuery(queryStringBlack)
    ]).then((result) => {
      return {
        whiteCards: parseWhiteCards(result[0]),
        blackCards: parseBlackCards(result[1])
      };
    });
  }

  function getCardsFromDecks(decks, callback) {
    var ors = '';

    for (var i = 0; i < decks.length; ++i) {
      if (i > 0) { ors = ors + ' OR '; }
      ors = ors + 'deck_id = ' + decks[i];
    }

    var queryStringWhite = 'SELECT id, text ' +
      'FROM white_cards ' +
      'WHERE active = 1 ' +
      'AND (' + ors + ')';
    var queryStringBlack = 'SELECT id, text, draw, pick ' +
      'FROM black_cards ' +
      'WHERE active = 1 ' +
      'AND (' + ors + ')';

    return Promise.all([
      runQuery(queryStringWhite),
      runQuery(queryStringBlack)
    ]).then((result) => {
      return {
        whiteCards: parseWhiteCards(result[0]),
        blackCards: parseBlackCards(result[1])
      };
    });
  }

  function newConnection() {
    var connection =  mysql.createConnection({
      host        : process.env.DB_HOST,
      port        : process.env.DB_PORT,
      user        : process.env.DB_USER,
      password    : process.env.DB_PASSWORD,
      database    : process.env.DB_NAME
    });

    connection.connect(function(err) {
      if (err) { throw err };
    });

    return connection;
  }

  function parseBlackCards(rows) {
    var cards = [];
    for (let r of rows) {
      var card = new BlackCard(r.id, r.text, r.draw, r.pick);
      cards.push(card);
    }
    return cards;
  }

  function parseWhiteCards(rows) {
    var cards = [];
    for (let r of rows) {
      var card = new WhiteCard(r.id, r.text);
      cards.push(card);
    }
    return cards;
  }

  function runQuery(queryString) {
    return new Promise((resolve, reject) => {
      var connection = newConnection();
      connection.query(queryString, function(err, rows, fields) {
        if (err) { reject(err) };
        connection.end();
        debug('Query complete');
        resolve(rows);
      });
    });
  }

  return {
    getActiveCards: getActiveCards,
    getAllCards: getAllCards,
    getCardsFromDecks: getCardsFromDecks,
    getDecks: getDecks
  }

}

module.exports = Database;
