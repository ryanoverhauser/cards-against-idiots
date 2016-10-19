app.controller('LobbyController', LobbyController);

LobbyController.$inject = ['$uibModal', 'socket', 'user'];

function LobbyController($uibModal, socket, user) {

    var $ctrl = this;

    $ctrl.inGame = false;
    $ctrl.games = [];
    $ctrl.decks = [];

    $ctrl.refreshGamesList = function() {
        socket.emit( 'getGames' );
    };

    $ctrl.joinGame = function(gameId) {
        socket.emit( 'joinGame', { gameId: gameId } );
    };

    $ctrl.createGame = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'templates/create',
            controller: 'CreateGameModalController as create',
            size: "lg",
            resolve: {
                decks: function () {
                    return $ctrl.decks;
                }
            }
        });

        modalInstance.result.then(function (options) {
            var gameOpts = {
                name: options.name,
                decks: options.decks,
                customDecks: options.customDecks,
                scoreLimit: options.scoreLimit.value,
                roundTime: options.roundTime.value,
                czarTime: options.czarTime.value
            };
            // socket.emit('createGame', gameOpts);
            console.log('createGame', gameOpts);
        }, function () {
            // console.log('Modal dismissed at: ' + new Date());
        });
    };


    // Socket event handlers
    // =====================

    socket.on('initialized', function (data) {
        $ctrl.games = data.games;
        $ctrl.decks = data.decks;
    });
    socket.on('gameList', function (data) {
        $ctrl.games = data.games;
        $ctrl.decks = data.decks;
    });
    socket.on('leftGame', function (data) {
        $ctrl.games = data.games;
    });

}
