'use strict';

switch (process.env.DB_TYPE) {
  case 'json':
    var Database = require('./db-json')();
    break;
  case 'mongodb':
    var Database = require('./db-mongo')();
    break;
  case 'mysql':
    var Database = require('./db-mysql')();
    break;
  default:
    var Database = require('./db-json')();
    break;
}

module.exports = Database;
