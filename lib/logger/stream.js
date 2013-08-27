/**
 * Module dependencies.
 */

var _ = require('lodash');

/**
 * Creates a new instance.
 *
 * @param {Logger} logger
 * @param {Object} [options]
 * @api private
 */

var Stream = module.exports = function(logger, options){
  options = options || {};

  this.hide = options.hide || 7;

  var self = this; 

  logger.on('log', function(data){
    if (logger.levels[data.level] < self.hide){
      self._write(data);
    }
  });
};

/**
 * Prints data to stream.
 * (Must implement)
 *
 * Data properties:
 *
 *   - `level`: Log level
 *   - `date`: Log created date
 *   - `message`: Log message
 *   - `error`: Log error
 *
 * @param {Object} data
 * @api private
 */

// Stream.prototype._write = function(data){};

/**
 * Sets the hide level.
 *
 * @param {Number} level
 * @return {Stream} for chaining
 * @api public
 */

Stream.prototype.setHide = function(level){
  this.hide = level;

  return this;
};