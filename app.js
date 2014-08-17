/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var fs = require('fs');
var https = require('https');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
require('./config/express')(app);
require('./routes')(app);

if (app.get('env') === 'production') {
  //use http server:
  //heroku terminates ssl connections at their load balancers
  //then sends http traffic to this app

  // Start server
  var server = require('http').createServer(app);
  server.listen(config.port, config.ip, function () {
    console.log('HTTP Express server port %d, in %s mode', config.port, app.get('env'));
  });

} else {
  //use https:
  //SSL CERTIFICATE and PRIVATE KEY
  //Private key and cert needed for making a https server
  var options = {
    key:  fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  };

  https.createServer(options, app).listen(config.port, function () {
    console.log('HTTPS Express server port %d, in %s mode', config.port, app.get('env'));
  });
}

// Expose app
exports = module.exports = app;
