var format = require('util').format,
  _ = require('lodash'),
  EventEmitter = require('events').EventEmitter;

var Logger = module.exports = function(options){
  options = options || {};

  this.store = [];

  this.levels = _.extend({
    error: 1,
    warn: 3,
    info: 5,
    debug: 7
  }, options.levels);

  this.alias = _.extend({
    e: 'error',
    err: 'error',
    w: 'warn',
    i: 'info',
    d: 'debug'
  }, options.alias);

  this.default = options.default = 'info';
};

Logger.prototype.__proto__ = EventEmitter.prototype;

Logger.prototype.setLevel = function(name, level, color){
  this.levels[name] = +level;

  return this;
};

Logger.prototype.setAlias = function(name, alias){
  this.alias[name] = alias;

  return this;
};

Logger.prototype.setDefault = function(name){
  this.default = name;

  return this;
};

Logger.prototype.log = function(){
  var args = _.toArray(arguments),
    level = args.shift();

  if (!this.levels.hasOwnProperty(level)){
    var alias = this.alias[level];

    if (this.levels.hasOwnProperty(alias)){
      level = alias;
    } else {
      args.unshift(level);
      level = this.default;
    }
  }

  var data = {
    level: level,
    date: new Date()
  }

  if (args[0] instanceof Error){
    data.error = args.shift();
    data.message = format.apply(null, args);
  } else {
    data.message = format.apply(null, args);
  }

  this.store.push(data);
  this._emit(level, data);
};

Logger.prototype._emit = function(level, data){
  this.emit('log', data);
  // this.emit(level, data);
};

['debug', 'info', 'warn', 'error'].forEach(function(i){
  Logger.prototype[i] = Logger.prototype[i[0]] = function(){
    var args = _.toArray(arguments);

    args.unshift(i);
    this.log.apply(this, args);

    return this;
  };
});

Logger.prototype.err = Logger.prototype.error;

Logger.stream = {
  Console: require('./console'),
  File: require('./file')
};