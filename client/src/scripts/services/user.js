app.factory('user', user);

function user() {
    var user = {
        id: null,
        name: null,
        initialized: false
    };
    var service = {
        init: init,
        id: id,
        name: name,
        initialized: initialized,
        getUser: getUser
    };

    return service;

    //////

    function init(id, name){
        user.id = id;
        user.name = name;
        user.initialized = true;
        return user;
    }

    function id(){
        return user.id;
    }

    function name(){
        return user.name;
    }

    function initialized(){
        return user.initialized;
    }

    function getUser(){
        return user;
    }

}