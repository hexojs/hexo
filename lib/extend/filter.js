var Promise = require('bluebird');

var typeAlias = {
  pre: 'before_post_render',
  post: 'after_post_render'
};

function Filter(){
  this.store = {};
}

Filter.prototype.list = function(type){
  if (!type) return this.store;
  return this.store[type] || [];
};

Filter.prototype.register = function(type, fn, priority){
  if (!fn){
    if (typeof type === 'function'){
      fn = type;
      type = 'after_post_render';
    } else {
      throw new TypeError('fn must be a function');
    }
  }

  type = typeAlias[type] || type;
  priority = priority == null ? priority : 10;

  var store = this.store[type] = this.store[type] || [];

  fn.priority = priority;
  store.push(fn);

  store.sort(function(a, b){
    return a.priority - b.priority;
  });
};

Filter.prototype.apply = function(type, args, sync, context){
  if (!args) args = [];
  if (!Array.isArray(args)) args = [args];

  var filters = this.list(type);

  if (sync){
    var result;

    for (var i = 0, len = filters.length; i < len; i++){
      result = filters[i].apply(context, args);
    }

    return result;
  } else {
    return Promise.map(filters, function(filter){
      return filter.apply(context, args);
    });
  }
};

module.exports = Filter;