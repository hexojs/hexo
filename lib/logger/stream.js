var _ = require('lodash');

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

Stream.prototype.setHide = function(level){
  this.hide = level;

  return this;
};