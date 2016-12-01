'use strict';

var debug = require('debug')('db');
var mysql = require('mysql');

var cards = require('./cards');
var BlackCard = cards.blackCard;
var WhiteCard = cards.whiteCard;

function DbMysql() {

  function getDecks() {
    var queryString = 'SELECT id, name, ' +
      '( SELECT COUNT(white_cards.id) ' +
        'FROM white_cards ' +
        'WHERE white_cards.deck_id = decks.id ' +
      ') as whiteCardCount, ' +
      '( SELECT COUNT(black_cards.id) ' +
        'FROM black_cards ' +
        'WHERE black_cards.deck_id = decks.id ' +
      ') as blackCardCount ' +
      'FROM decks';
    return runQuery(queryString);
  }

  function getCardsFromDecks(decks) {
    var ors = '';

    for (var i = 0; i < decks.length; ++i) {
      if (i > 0) { ors = ors + ' OR '; }
      ors = ors + 'deck_id = ' + decks[i];
    }

    var queryStringWhite = 'SELECT id, text ' +
      'FROM white_cards ' +
      'WHERE (' + ors + ')';
    var queryStringBlack = 'SELECT id, text, draw, pick ' +
      'FROM black_cards ' +
      'WHERE (' + ors + ')';

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
        resolve(rows);
      });
    });
  }

  return {
    getCardsFromDecks: getCardsFromDecks,
    getDecks: getDecks
  }

}

module.exports = DbMysql;
