var connect = require('connect'),
  config = hexo.config,
  log = require('./util').log;

var app = connect.createServer();

module.exports = function(){
  app.use(connect.static(hexo.public_dir));
  app.use(connect.staticCache());
  app.use(connect.compress());

  app.listen(config.port, function(){
    console.log('Hexo is running on http://localhost:%d. Press Ctrl+C to stop.', config.port);
  });
};