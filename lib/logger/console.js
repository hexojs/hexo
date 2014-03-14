var _ = require('lodash'),
  colors = require('colors'),
  moment = require('moment'),
  Stream = require('./stream');

/**
* Console stream.
*
* @class Console
* @param {Logger} logger
* @param {Object} options
* @constructor
* @extends Logger.Stream
* @namespace Logger.Stream
* @module hexo
*/

var Console = module.exports = function(logger, options){
  options = options || {};

  Stream.call(this, logger, options);

  /**
  * Format.
  *
  * @property format
  * @type String
  */

  this.format = options.format || '[:level] :message';

  /**
  * Colors.
  *
  * @property colors
  * @type Object
  */

  this.colors = _.extend({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'grey'
  }, options.colors);
};

Console.prototype.__proto__ = Stream.prototype;

/**
* Writes data to process stream.
*
* @method _write
* @param {Object} data
* @private
*/

Console.prototype._write = function(data){
  var message = '';

  if (data.error){
    var err = data.error;
    message = err.name + ': ' + err.message + '\n' + err.stack.grey + '\n' + data.message;
  } else {
    message = data.message;
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

/**
* Sets color.
*
* @method setColor
* @param {String} level
* @param {String} color
* @chainable
*/

Console.prototype.setColor = function(level, color){
  this.colors[level] = color;

  return this;
};

/**
* Sets format.
*
* @method setFormat
* @param {String} format
* @chainable
*/

Console.prototype.setFormat = function(format){
  this.format = format;

  return this;
};