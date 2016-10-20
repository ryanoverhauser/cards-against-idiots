'use strict';

// Load .env
require('dotenv').config({
  silent: true
});

// Start server
require('./server/server')();
