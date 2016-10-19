app.factory('user', function() {

    var user = {
        id: null,
        name: null,
        initialized: false
    };
    
    return {
        init: function(id, name){
            user.id = id;
            user.name = name;
            user.initialized = true;
            return user;
        },
        id: function(){ return user.id; },
        name: function(){ return user.name; },
        initialized: function(){ return user.initialized; },
        getUser: function(){ return user; }
    };

});