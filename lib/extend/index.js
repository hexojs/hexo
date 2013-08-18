var Extend = module.exports = function(){
};

Extend.prototype.module = function(name, fn){
  this[name] = new fn();
};