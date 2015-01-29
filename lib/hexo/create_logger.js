'use strict';

var bunyan = require('bunyan');
var moment = require('moment');
var chalk = require('chalk');

var dateFormat = 'HH:mm:ss.SSS';

var levelNames = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO ',
  40: 'WARN ',
  50: 'ERROR',
  60: 'FATAL'
};

var levelColors = {
  10: 'gray',
  20: 'gray',
  30: 'green',
  40: 'yellow',
  50: 'red',
  60: 'magenta'
};

function ConsoleStream(env){
  this.debug = env.debug;
}

ConsoleStream.prototype.write = function(data){
  var level = data.level;
  var msg = '';

  // Time
  if (this.debug){
    msg += chalk.gray(moment(data.time).format(dateFormat)) + ' ';
  }

  // Level
  msg += chalk[levelColors[level]](levelNames[level]) + ' ';

  // Message
  msg += data.msg + '\n';

  // Error
  if (data.err){
    var err = data.err.stack || data.err.message;
    if (err) msg += chalk.gray(err) + '\n';
  }

  process.stdout.write(msg);
};

function createLogger(env){
  var streams = [];

  if (!env.silent){
    streams.push({
      type: 'raw',
      level: env.debug ? 'trace' : 'info',
      stream: new ConsoleStream(env)
    });
  }

  if (env.debug){
    streams.push({
      level: 'trace',
      path: 'debug.log'
    });
  }

  var logger = bunyan.createLogger({
    name: 'hexo',
    streams: streams,
    serializers: {
      err: bunyan.stdSerializers.err
    }
  });

  // Alias for logger levels
  logger.d = logger.debug;
  logger.i = logger.info;
  logger.w = logger.warn;
  logger.e = logger.error;
  logger.log = logger.info;

  return logger;
}

module.exports = createLogger;