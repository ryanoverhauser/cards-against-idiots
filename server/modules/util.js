function Util(){

    var findByKeyValue = function( source, key, value ) {
        return source.filter(function( obj ) {
            return obj[key] === value;
        })[ 0 ];
    }

    var generateUID = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return function() {
            return s4() + s4() + s4() + s4();
        };
    }();

    var has = function(data) {
        return ( typeof(data) !== 'undefined' && data !== null) ? true : false;
    }

    return {
        findByKeyValue: findByKeyValue,
        generateUID: generateUID,
        has: has
    }
};

module.exports = Util();