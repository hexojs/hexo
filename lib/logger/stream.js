var _ = require('lodash');

/**
* Logger stream.
*
* This is an abstract class. Every logger stream should inherit this class and implement `_write` method. For example:
*
* ``` js
* var CustomStream = function(logger, options){
*   Stream.apply(this, arguments);
* };
*
* CustomStream.prototype.__proto__ = Stream.prototype;
*
* CustomStream.prototype._write = function(data){
*   //
* };
* ```
*
* @class Stream
* @param {Logger} logger
* @param {Object} options
* @constructor
* @namespace Logger
* @module hexo
*/

var Stream = module.exports = function(logger, options){
  options = options || {};

  /**
  * Hide level.
  *
  * @property hide
  * @type Number
  */

  this.hide = options.hide || 7;

  var self = this;

  logger.on('log', function(data){
    if (logger.levels[data.level] < self.hide){
      self._write(data);
    }
  });
};

// Stream.prototype._write = function(data){};

/**
* Set hide level.
*
* @method setHide
* @param {Number} level
* @chainable
*/

Stream.prototype.setHide = function(level){
  this.hide = level;

  return this;
};