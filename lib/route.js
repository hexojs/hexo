var store = {};

exports.list = function(){
  return store;
};

exports.get = function(name){
  return store[name];
};

exports.set = function(name, content){
  store[name] = content;
};