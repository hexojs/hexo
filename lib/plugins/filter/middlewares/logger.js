var morgan = require('morgan');

module.exports = function(app){
  var config = hexo.config,
    args = hexo.env.args,
    logger = args.l || args.log;

  // Fix #746
  if (typeof config.logger_format !== 'string') config.logger_format = 'dev';

  if (logger){
    app.use(morgan(typeof logger === 'string' ? logger : config.logger_format));
  } else if (config.logger || hexo.env.debug){
    app.use(morgan(config.logger_format));
  }
};