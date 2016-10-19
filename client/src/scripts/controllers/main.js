app.controller('MainController', MainController);

MainController.$inject = ['socket', 'user'];

function MainController( socket, user ) {

    var $ctrl = this;

    $ctrl.addAlert = addAlert;
    $ctrl.alerts = [];
    $ctrl.closeAlert = closeAlert;
    $ctrl.init = init;
    $ctrl.initialized = false;

    // socket.emit('init', {name: 'foobar'});

    socket.on('alert', function(data){
        addAlert(data);
    });

    socket.on('initialized', function (data) {
        user.init(data.userId, data.userName);
        $ctrl.initialized = true;
        console.log('user initialized', user.getUser());
        console.log('games', data.games);
        console.log('decks', data.decks);
    });

    //////

    function addAlert(alert) {
        $ctrl.alerts.push({
            type: alert.type || 'warning',
            msg: alert.msg
        });
    }

    function closeAlert(index) {
        $ctrl.alerts.splice(index, 1);
    }

    function init() {
        console.log("hello");
        if ($ctrl.user.$valid) {
            console.log("valid");
            socket.emit( 'init', {name: $ctrl.user.name});
        }
    }

}
