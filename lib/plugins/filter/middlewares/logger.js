var morgan = require('morgan');

module.exports = function(app){
  var config = hexo.config,
    args = hexo.env.args,
    logger = args.l || args.log;

  if (logger){
    app.use(morgan(typeof logger === 'string' ? logger : config.logger_format));
  } else if (config.logger || hexo.env.debug){
    app.use(morgan(config.logger_format));
  }
};