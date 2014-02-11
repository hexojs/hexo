var format = require('util').format,
  _ = require('lodash'),
  EventEmitter = require('events').EventEmitter;

/**
* This module is used for log.
*
* @class Logger
* @constructor
* @extends EventEmitter
* @module hexo
*/

var Logger = module.exports = function(options){
  options = options || {};

  /**
  * @property store
  * @type Array
  */

  this.store = [];

  /**
  * @property levels
  * @type Object
  */

  this.levels = _.extend({
    error: 1,
    warn: 3,
    info: 5,
    debug: 7
  }, options.levels);

  /**
  * @property alias
  * @type Object
  */

  this.alias = _.extend({
    e: 'error',
    err: 'error',
    w: 'warn',
    i: 'info',
    d: 'debug'
  }, options.alias);

  /**
  * @property default
  * @type String
  * @default info
  */

  this.default = options.default || 'info';
};

Logger.prototype.__proto__ = EventEmitter.prototype;

/**
* Set a new level.
*
* @method setLevel
* @param {String} name
* @param {Number} level
* @chainable
*/

Logger.prototype.setLevel = function(name, level){
  this.levels[name] = +level;

  return this;
};

/**
* Set a new alias.
*
* @method setAlias
* @param {String} name
* @param {String} alias
* @chainable
*/

Logger.prototype.setAlias = function(name, alias){
  this.alias[name] = alias;

  return this;
};

/**
* Set the default level.
*
* @method setDefault
* @param {String} name
* @chainable
*/

Logger.prototype.setDefault = function(name){
  this.default = name;

  return this;
};

/**
* Create a new log.
*
* @method log
* @param {String} [level]
* @param {String} msg*
* @chainable
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
  };

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
* Fires a new event.
*
* @method _emit
* @param {String} level
* @param {Object} data
* @private
*/

Logger.prototype._emit = function(level, data){
  /**
  * Fires when a new log created.
  *
  * @event log
  */

  this.emit('log', data);
  // this.emit(level, data);
};

/**
* Creates a new log on debug level.
*
* `debug` is also alias as `d`.
*
* @method debug
* @param {String} msg*
* @chainable
*/

/**
* Creates a new log on info level.
*
* `info` is also alias as `i`.
*
* @method info
* @param {String} msg*
* @chainable
*/

/**
* Creates a new log on warn level.
*
* `warn` is also alias as `w`.
*
* @method warn
* @param {String} msg*
* @chainable
*/

/**
* Creates a new log on error level.
*
* `error` is also alias as `e`, `err`.
*
* @method error
* @param {String} msg*
* @chainable
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
* @property stream
* @type Object
* @static
*/

Logger.stream = {
  Console: require('./console'),
  File: require('./file')
};