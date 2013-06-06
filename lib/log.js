var fs = require('graceful-fs'),
  _ = require('lodash'),
  term = require('term'),
  util = require('util'),
  store = [];

var log = module.exports = function(){
  var args = _.toArray(arguments),
    level = args.shift();

  if (Object.keys(levels).indexOf(level) == -1){
    args.unshift(level);
    level = 'info';
  }

  var data = {
    level: level,
    date: new Date()
  };

  if (args[0].constructor === Error){
    var err = args[0],
      message = err.name + ': ' + err.message + '\n' + err.stack.blackBright;

    data.message = err.name + ': ' + err.message + '\n' + err.stack;
  } else {
    var message = data.message = util.format.apply(null, args);
  }

  store.push(data);
  console.log('[%s]', level.toUpperCase()[levels[level]], message);

  return this;
};

var levels = log.levels = {
  debug: 'blackBright',
  info: 'green',
  warn: 'yellow',
  error: 'red'
};

['debug', 'info', 'warn', 'error'].forEach(function(i){
  log[i] = log[i[0]] = function(){
    var args = _.toArray(arguments);
    args.unshift(i);
    log.apply(null, args);
  };
});

log.err = log.error;

log.save = function(path, callback){
  var data = '';

  store.forEach(function(item){
    data += '[' + item.level.toUpperCase() + '] ' + item.date.toISOString() + '\n' + item.message + '\n';
  });

  fs.appendFile(path, data, function(err){
    if (err) return callback && callback(err);

    store = [];

    callback && callback();
  });
};