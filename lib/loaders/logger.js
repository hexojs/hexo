var colors = require('colors'),
  path = require('path'),
  Logger = require('../logger');

module.exports = function(callback){
  var logger = hexo.log = new Logger({
    levels: {
      create: 5,
      update: 5,
      delete: 5,
      skip: 7
    }
  });

  if (hexo.env.silent) return callback();

  var consoleStream = new Logger.stream.Console(logger, {
    colors: {
      create: 'green',
      update: 'yellow',
      delete: 'red',
      skip: 'grey'
    }
  });

  if (!hexo.env.debug) return callback();

  consoleStream.setFormat('[:level] ' + ':date'.grey + ' :message');
  consoleStream.setHide(9);

  var logPath = path.join(hexo.base_dir, 'debug.log'),
    FileStream = Logger.stream.File;

  FileStream.prepare(logPath, function(err){
    if (err) return log.e(err);

    var fileStream = new FileStream(logger, {
      path: logPath,
      hide: 9
    });

    callback();
  });
};