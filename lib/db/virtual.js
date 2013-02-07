function Virtual(name){
  this.name = name;
  this.getter = function(){
    return null;
  };
  this.setter = function(){
    return null;
  };
};

module.exports = Virtual;

Virtual.prototype.get = function(fn){
  this.getter = fn;
  return this;
};

Virtual.prototype.set = function(fn){
  this.setter = fn;
  return this;
};