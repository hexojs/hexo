var HexoError = module.exports = function(msg){
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = msg;
  this.name = 'HexoError';
};

HexoError.prototype.__proto__ = Error.prototype;

HexoError.ExtendError = require('./extend');
HexoError.wrap = require('./wrap');