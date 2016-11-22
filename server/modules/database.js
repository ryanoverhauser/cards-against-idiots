'use strict';

switch (process.env.DB_TYPE) {
  case 'file':
    var Database = require('./db-file')();
    break;
  case 'mysql':
    var Database = require('./db-mysql')();
    break;
}

module.exports = Database;
