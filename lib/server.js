var connect = require('connect'),
  async = require('async'),
  config = require('./config'),
  log = require('./log');

var app = connect.createServer();

module.exports = function(root){
  async.auto({
    init: function(next){
      config.init(root, next);
    },
    server: ['init', function(next){
      app.use(connect.static(root + '/public'));
      app.use(connect.compress());

      app.listen(config.port, function(){
        log.info('Writer is running on http://localhost:%d.', config.port);
      });
    }]
  });
};