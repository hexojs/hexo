var connect = require('connect'),
  extend = require('../extend');

extend.console.register('server', 'Run Server', function(args){
  var app = connect.createServer(),
    config = hexo.config;

  app.use(connect.static(hexo.public_dir));
  app.use(connect.staticCache());
  app.use(connect.compress());

  app.listen(config.port, function(){
    console.log('Hexo is running at http://localhost:%d. Press Ctrl+C to stop.', config.port);
  });
});