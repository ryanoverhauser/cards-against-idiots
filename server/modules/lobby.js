'use strict';

var debug = require('debug')('lobby'),
    database = require('./database');

function Lobby(){

    var games = [{
            name: "Demo Game",
            playerCount: 5,
            playerLimit: 8
        }],
        decks = false,
        initialized = false;

    loadDecks();

    function loadDecks(){
        debug('Loading decks...')
        var db = database();
        db.open();
        db.getDecks(function(data){
            db.close();
            decks = data;
            initialized = true;
            debug("Decks loaded", data);
        }); 
    };

    function getGames(){
        return games;
    }

    function getDecks(){
        return decks;
    }

    return {
        getGames: getGames,
        getDecks: getDecks
    }
    
}

module.exports = Lobby;