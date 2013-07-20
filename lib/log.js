/**
 * Module dependencies.
 */

var fs = require('graceful-fs'),
  _ = require('lodash'),
  term = require('term'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter;

/**
 * Initialize a new logger with the given `options`.
 *
 * @param {Object} options
 * @api private
 */

var Log = module.exports = function(options){
  if (options === undefined) options = {};

  this.store = [];

  this.levels = _.extend({
    error: 2,
    warn: 4,
    info: 6,
    debug: 7
  }, options.levels);

  this.color = _.extend({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blackBright'
  }, options.colors);

  this.alias = _.extend({
    e: 'error',
    err: 'error',
    w: 'warn',
    i: 'info',
    d: 'debug'
  }, options.alias);

  this.hide = options.hide || 7;
  this.defaults = options.defaults || 'info';
};

/**
 * Inherit EventEmitter
 */

util.inherits(Log, EventEmitter);

/**
 * Print `message` in the terminal on the given `level`.
 *
 * @param {String} level
 * @param {String} message
 * @return {Log} for chaining
 * @api public
 */

Log.prototype.log = function(level, message){
  var args = _.toArray(arguments),
    level = args.shift();

  if (Object.keys(this.levels).indexOf(level) == -1){
    if (Object.keys(this.alias).indexOf(level) == -1){
      args.unshift(level);
      level = this.defaults;
    } else {
      level = this.alias[level];
    }
  }

  var data = {
    level: level,
    levelNum: this.levels[level]
  };

  if (args[0].stack){
    var err = args[0],
      message = err.name + ': ' + err.message + '\n' + err.stack.blackBright;

    data.message = err.name + ': ' + err.message + '\n' + err.stack;
  } else {
    var message = data.message = util.format.apply(null, args);
  }

  this.store.push(data);
  this.emit('log', data);
  if (this.levels[level] < this.hide) console.log('[%s]', level.toUpperCase()[this.color[level]], message);

  return this;
};

/**
 * Save log to the given `path`.
 *
 * @param {String} path
 * @param {Function} callback
 * @return {Log} for chaining
 * @api public
 */

Log.prototype.save = function(path, callback){
  var self = this;

  fs.appendFile(path, this.toString(), function(err){
    if (err) return callback && callback(err);

    self.store = [];

    callback && callback();
  });

  return this;
};

/**
 * Save log to the given `path` synchronously.
 *
 * @param {String} path
 * @return {Log} for chaining
 * @api public
 */

Log.prototype.saveSync = function(path){
  fs.appendFile(path, this.toString());

  this.store = [];

  return this;
};

/**
 * Transform all logs to string
 *
 * @return {String}
 * @api private
 */

Log.prototype.toString = function(){
  var data = '';

  this.store.forEach(function(item){
    data += '[' + item.level.toUpperCase() + '] ' + item.date.toISOString() + '\n' + item.message + '\n';
  });

  return data;
};

/**
 * Alias:
 *
 *   - log.debug = log.d = log.log('debug')
 *   - log.info = log.i = log.log('info')
 *   - log.warn = log.w = log.log('warn')
 *   - log.error = log.e = log.log('error')
 *
 */

['debug', 'info', 'warn', 'error'].forEach(function(i){
  Log.prototype[i] = Log.prototype[i[0]] = function(){
    var args = _.toArray(arguments);

    args.unshift(i);
    this.log.apply(this, args);

    return this;
  };
});

/**
 * Alias: log.err = log.error
 */

Log.prototype.err = Log.prototype.error;