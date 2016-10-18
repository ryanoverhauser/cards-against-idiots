'use strict';

var debug = require('debug')('user'),
    util = require('./util'),
    validator = require('validator');

class User{

    constructor(socketId) {
        this._id = util.generateUID();
        this.socketId = socketId;
        this.name = undefined;
        this.initialized = false;
        this.inGame = false;
    }

    init(data) {
        if ( validator.isLength( data.name, 1, 20 ) ) {
            this.name = data.name;
            this.initialized = true;
            return true;
        }
        return false;
    }

};

module.exports = User;