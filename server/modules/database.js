var debug = require('debug')('database'),
    mysql = require('mysql');

function Database() {

  var connection;

  return {

    getDecks: function(callback) {
      connection.query('SELECT id, name, (SELECT COUNT(white_cards.id) FROM white_cards WHERE white_cards.deck_id = card_decks.id) as white_card_count, (SELECT COUNT(black_cards.id) FROM black_cards WHERE black_cards.deck_id = card_decks.id) as black_card_count FROM card_decks', function(err, rows, fields) {
        if (err) throw err;
        callback(rows);
      });
    },
    getAllCards: function(callback){
      var white,
          black;
      connection.query('SELECT id, text FROM white_cards', function(err, rows, fields) {
        if (err) throw err;
        white = rows;
        connection.query('SELECT id, text, draw, pick FROM black_cards', function(err, rows, fields) {
          if (err) throw err;
          black = rows;
          callback(white, black);
        });
      });
    },
    getActiveCards: function(callback){
      var white,
          black;
      connection.query('SELECT white_cards.id, white_cards.text FROM white_cards INNER JOIN card_decks ON white_cards.deck_id = card_decks.id WHERE white_cards.active = 1 AND card_decks.active = 1', function(err, rows, fields) {
        if (err) throw err;
        white = rows;
        connection.query('SELECT black_cards.id, black_cards.text, black_cards.draw, black_cards.pick FROM black_cards INNER JOIN card_decks ON black_cards.deck_id = card_decks.id WHERE black_cards.active = 1 AND card_decks.active = 1', function(err, rows, fields) {
          if (err) throw err;
          black = rows;
          callback(white, black);
        });
      });
    },
    getCardsFromDecks: function(decks, callback){
      var white,
          black,
          ors = '';
      for (i = 0; i < decks.length; ++i) {
        if (i > 0) ors = ors + ' OR ';
        ors = ors + 'deck_id = ' + decks[i];
      }
      connection.query('SELECT id, text FROM white_cards WHERE active = 1 AND (' + ors + ')', function(err, rows, fields) {
        if (err) throw err;
        white = rows;
        connection.query('SELECT id, text, draw, pick FROM black_cards WHERE active = 1 AND (' + ors + ')', function(err, rows, fields) {
          if (err) throw err;
          black = rows;
          callback(white, black);
        });
      });
    },
    open: function(){
      debug("Opening mysql connection");
      connection = mysql.createConnection({
        host        : process.env.DB_HOST,
        port        : process.env.DB_PORT,
        user        : process.env.DB_USER,
        password    : process.env.DB_PASSWORD,
        database    : process.env.DB_NAME
      });
      connection.connect(function(err) {
        if (err) throw err;
      });
    },
    close: function(){
      debug("Closing mysql connection");
      connection.end();
    }

  }

}

module.exports = Database;