app.controller('MainController', ['$rootScope', '$scope', 'socket', function( $rootScope, $scope, socket ){

    console.log("hello!");

    socket.emit('init', {name: 'foobar'});
    
    socket.on('initialized', function (data) {
        console.log('initialized', data);
    });

}]);
