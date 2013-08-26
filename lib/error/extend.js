var HexoError = require('./index');

var ExtendError = module.exports = function(msg){
  HexoError.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ExtendError';
};

ExtendError.prototype.__proto__ = HexoError.prototype;