'use strict';

switch (process.env.DB_TYPE) {
  case 'mongodb':
    var Database = require('./db-mongo')();
    break;
  case 'mysql':
    var Database = require('./db-mysql')();
    break;
  default:
    var Database = require('./db-file')();
    break;
}

module.exports = Database;
