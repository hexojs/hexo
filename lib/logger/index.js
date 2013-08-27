/**
 * Module dependencies.
 */

var format = require('util').format,
  _ = require('lodash'),
  EventEmitter = require('events').EventEmitter;

/**
 * Creates a new instance.
 *
 * @param {Object} options
 * @api private
 */

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

/**
 * Inherits from EventEmitter.
 */

Logger.prototype.__proto__ = EventEmitter.prototype;

/**
 * Sets a level.
 *
 * @param {String} name
 * @param {Number} level
 * @return {Logger} for chaining
 * @api public
 */

Logger.prototype.setLevel = function(name, level){
  this.levels[name] = +level;

  return this;
};

/**
 * Sets an alias.
 *
 * @param {String} name
 * @param {String} alias
 * @return {Logger} for chaining
 * @api public
 */

Logger.prototype.setAlias = function(name, alias){
  this.alias[name] = alias;

  return this;
};

/**
 * Sets the default level.
 *
 * @param {String} name
 * @return {Logger} for chaining
 * @api public
 */

Logger.prototype.setDefault = function(name){
  this.default = name;

  return this;
};

/**
 * Adds a log.
 *
 * @param {String} [level]
 * @param {String} message
 * @return {Logger} for chaining
 * @api public
 */

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

  return this;
};

/**
 * Emits an event.
 *
 * @param {String} level
 * @param {Object} data
 * @api private
 */

Logger.prototype._emit = function(level, data){
  this.emit('log', data);
  // this.emit(level, data);
};

/**
 * Aliases:
 *
 *   - debug -> d
 *   - info -> i
 *   - warn -> w
 *   - error -> e, err
 */

['debug', 'info', 'warn', 'error'].forEach(function(i){
  Logger.prototype[i] = Logger.prototype[i[0]] = function(){
    var args = _.toArray(arguments);

    args.unshift(i);
    this.log.apply(this, args);

    return this;
  };
});

Logger.prototype.err = Logger.prototype.error;

/**
 * Exposes streams.
 */

Logger.stream = {
  Console: require('./console'),
  File: require('./file')
};