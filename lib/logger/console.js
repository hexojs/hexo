var _ = require('lodash'),
  colors = require('colors'),
  moment = require('moment'),
  Stream = require('./stream');

var Console = module.exports = function(logger, options){
  options = options || {};

  Stream.call(this, logger, options);

  this.format = options.format || '[:level] :message';

  this.colors = _.extend({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'grey'
  }, options.colors);
};

Console.prototype.__proto__ = Stream.prototype;

Console.prototype._write = function(data){
  if (data.error){
    var err = data.error,
      message = err.name + ': ' + err.message + '\n' + err.stack.grey + '\n' + data.message;
  } else {
    var message = data.message;
  }

  var str = this.format
    .replace(/:level/g, data.level[this.colors[data.level]])
    .replace(/:message/g, message)
    .replace(/:date(\[(.+)\])?/g, function(){
      var format = arguments[2] || 'HH:mm:ss.SSS';

      return moment(data.date).format(format);
    });

  process[data.error ? 'stderr' : 'stdout'].write(str + '\n');
};

Console.prototype.setColor = function(level, color){
  this.colors[level] = color;

  return this;
};

Console.prototype.setFormat = function(format){
  this.format = format;

  return this;
};