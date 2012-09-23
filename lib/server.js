var connect = require('connect'),
  async = require('async'),
  config = require('./config'),
  log = require('./log');

var app = connect.createServer();

module.exports = function(){
  app.use(connect.static(__dirname + '/../public'));
  app.use(connect.compress());

  app.listen(config.port, function(){
    log.info('Writer is running on http://localhost:%d', config.port);
  });
};