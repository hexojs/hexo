var _ = require('underscore');

var Query = module.exports = function(store, parent){
  this.store = store;
  this.parent = parent;
};

Query.prototype.forEach = Query.prototype.each = function(iterator){
  for (var i=0, len=this.store.length; i<len; i++){
    iterator(this.store[i], this.store[i]._id);
  }

  return this;
}

Query.prototype.count = function(){
  return this.store.length;
};

Query.prototype.first = function(){
  return this.store[0];
};

Query.prototype.last = function(){
  return this.store[this.store.length - 1];
};

Query.prototype.toArray = function(){
  return this.store;
};

Query.prototype.get = function(id){
  if (_.isArray(id)){
    var arr = [];
    for (var i=0, len=id.length; i<len; i++){
      arr.push(this.parent.get(id[i]));
    }
    return arr;
  } else {
    return this.parent.get(id);
  }
};

Query.prototype.slice = function(start, end){
  return new Query([].slice.apply(this.store, arguments), this.parent);
};

Query.prototype.skip = function(num){
  return this.slice(num);
};

Query.prototype.limit = function(num){
  return this.slice(0, num);
};

Query.prototype.reverse = function(){
  return new Query(this.store.reverse(), this.parent);
};

Query.prototype.random = Query.prototype.shuffle = function(){
  var arr = this.toArray().sort(function(a, b){
    return Math.random() - 0.5 < 0;
  });

  return new Query(arr, this.parent);
};

Query.prototype.select = function(fields){
  if (!_.isArray(fields)) fields = _.toArray(arguments);

  var arr = [];

  this.each(function(item){
    var obj = {};

    fields.forEach(function(field){
      var split = field.split('.'),
        lastSplit = split.pop(),
        getter = item,
        setter = obj;

      for (var i=0, len=split.length - 1; i<len; i++){
        var item = split[i];
        getter = getter[item];
        setter = setter[item] = setter[item] || {};
      }

      setter[lastSplit] = getter[lastSplit];
    });

    arr.push(obj);
  });

  return new Query(arr, this.parent);
};

Query.prototype.sort = function(orderby, order){
  var arr = this.toArray().sort(function(a, b){
    var orderA = a[orderby],
      orderB = b[orderby];

    if (orderA < orderB) return -1;
    else if (orderA > orderB) return 1;
    else return 0;
  });

  if (order){
    order = order.toString();
    if (order == -1 || order.toLowerCase() === 'desc') arr = arr.reverse();
  }

  return new Query(arr, this.parent);
};

Query.prototype.update = function(obj){
  this.each(function(item, id){
    this.parent.update(id, obj);
  });

  return this;
};

Query.prototype.replace = function(obj){
  this.each(function(item, id){
    this.parent.replace(id, obj);
  });

  return this;
};

Query.prototype.remove = function(){
  var _this = this;
  this.each(function(item, id){
    delete _this.parent.store[id];
  });
};