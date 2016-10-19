app.factory('util', function(){

    return {
        findByKeyValue: function ( source, key, value ) {
            return source.filter(function( obj ) {
                return obj[key] === value;
            })[ 0 ];
        }
    };

});

  