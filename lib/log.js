var colors = require('colors'),
  format = require('util').format,
  _ = require('lodash'),
  moment = require('moment'),
  fs = require('graceful-fs'),
  EventEmitter = require('events').EventEmitter;

// https://github.com/medikoo/cli-color/blob/master/lib/trim.js
var rTrim = new RegExp('\x1b(?:\\[(?:\\d+[ABCDEFGJKSTm]|\\d+;\\d+[Hfm]|' +
  '\\d+;\\d+;\\d+m|6n|s|u|\\?25[lh])|\\w)', 'g');

var Log = module.exports = function(options){
  if (!options) options = {};

  this.store = [];

  this.levels = _.extend({
    error: 1,
    warn: 3,
    info: 5,
    debug: 7
  }, options.levels);

  this.color = _.extend({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'grey'
  }, options.colors);

  this.alias = _.extend({
    e: 'error',
    err: 'error',
    w: 'warn',
    i: 'info',
    d: 'debug'
  }, options.alias);

  this.hide = options.hasOwnProperty('hide') ? options.hide : 7;
  this.default = options.default || 'info';

  this.format = options.format || '[:level] :date[HH:mm:ss] :message';
};

Log.prototype.__proto__ = EventEmitter.prototype;

Log.prototype.setLevel = function(name, level, color){
  this.levels[name] = +level;
  this.color[name] = color || 'white';

  return this;
};

Log.prototype.setColor = function(name, color){
  this.color[name] = color;

  return this;
};

Log.prototype.setAlias = function(name, alias){
  this.alias[name] = alias;

  return this;
};

Log.prototype.setHide = function(level){
  this.hide = level;

  return this;
};

Log.prototype.setDefault = function(name){
  this.default = name;

  return this;
};

Log.prototype.setFormat = function(format){
  this.format = format;

  return this;
};

Log.prototype.log = function(){
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

  if (args[0] instanceof Error){
    var err = args[0],
      message = err.name + ': ' + err.message + '\n' + err.stack.grey;
  } else {
    var message = format.apply(null, args);
  }

  var data = {
    level: level,
    message: message,
    date: new Date()
  };

  this.store.push(data);
  this.emit('log', data);

  return this;
};

Log.prototype.toString = function(data, trim){
  var str = this.format
    .replace(/:level/, data.level.toUpperCase()[this.color[data.level]])
    .replace(/:message/, data.message)
    .replace(/:date(\[(.+)\])?/, function(){
      var format = arguments[2];

      return format ? moment(data.date).format(format) : data.date.toISOString()
    });

  return trim ? _trim(str) : str;
};

var _trim = Log.prototype._trim = function(str){
  return str.replace(rTrim, '');
};

Log.prototype.toJSON = function(){
  var arr = [];

  this.store.forEach(function(item){
    arr.push({
      level: item.level,
      message: _trim(item.message),
      date: item.date
    });
  });

  return arr;
};

['debug', 'info', 'warn', 'error'].forEach(function(i){
  Log.prototype[i] = Log.prototype[i[0]] = function(){
    var args = _.toArray(arguments);

    args.unshift(i);
    this.log.apply(this, args);

    return this;
  };
});

Log.prototype.err = Log.prototype.error;