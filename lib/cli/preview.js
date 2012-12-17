var extend = require('../extend'),
  route = require('../route'),
  connect = require('connect'),
  clc = require('cli-color');

extend.console.register('preview', 'Preview site', function(args){
  var generate = require('../generate'),
    app = connect.createServer(),
    config = hexo.config;

  if (config.logger){
    if (config.logger_format) app.use(connect.logger(config.logger_format));
    else app.use(connect.logger());
  }

  app.use(connect.static(hexo.public_dir));
  app.use(connect.compress());

  app.use(function(req, res){
    console.log(req);
  });

  app.listen(config.port, function(){
    console.log('Hexo is running at %s. Press Ctrl+C to stop.', clc.bold('http://localhost:' + config.port));
  });
});