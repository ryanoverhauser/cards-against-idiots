'use strict';

var debug = require('debug')('socket'),
    lobby = require('./lobby'),
    User = require('./user'),
    util = require('./util');

function Socket(server) {

    var io = require('socket.io')(server);
    io.sockets.on('connection', function (socket){
        
        var user = new User(socket.client.id);
        debug('user connected: ' + user.socketId);

        socket.on('init', function(data){
            if (!user.initialized && util.has(data)) {
                if (user.init(data)) {
                    debug('user initialized with name: ' + user.name);
                    socket.join('lobby');
                    socket.emit('initialized', {
                        userId: user.id
                    });
                } else {
                    socket.emit('alert', {
                        msg: "Please choose a name between 1 and 20 characters."
                    });
                }
            }
        });

    });

}

module.exports = Socket;