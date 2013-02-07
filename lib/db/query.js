var _ = require('underscore');

function Query(index, fields, parent){
  this.index = index;
  this.fields = fields;
  this.parent = parent;

  this.__defineGetter__('length', function(){
    return this.index.length;
  });

  this.parent.on('remove', function(id){
    var position = index.indexOf(id);
    if (position !== -1){
      index.splice(position, 1);
    }
  });
};

module.exports = Query;

Query.prototype.forEach = Query.prototype.each = function(iterator){
  var index = this.index;
  for (var i=0, len=this.length; i<len; i++){
    var item = index[i];
    iterator(this.get(item), item);
  }
  return this;
}

Query.prototype.first = function(){
  return this.get(this.index[0]);
};

Query.prototype.last = function(){
  return this.get(this.index[this.length - 1]);
};

Query.prototype.toArray = function(){
  var result = [];
  this.each(function(item){
    result.push(item);
  });
  return result;
};

Query.prototype.get = function(id){
  if (_.isArray(id)){
    var arr = [];
    for (var i=0, len=id.length; i<len; i++){
      arr.push(this.parent.get(id[i]));
    }
    return arr;
  } else {
    var fields = this.fields,
      data = this.parent.get(id);
    if (fields){
      return _.pick(data, this.fields);
    } else {
      return data;
    }
  }
};

Query.prototype.slice = function(start, end){
  return new Query([].slice.apply(this.index, arguments), this.fields, this.parent);
};

Query.prototype.skip = function(num){
  return this.slice(num);
};

Query.prototype.limit = function(num){
  return this.slice(0, num);
};

Query.prototype.reverse = function(){
  return new Query(this.index.reverse(), this.fields, this.parent);
};

Query.prototype.random = Query.prototype.shuffle = function(){
  var arr = this.index.sort(function(a, b){
    return Math.random() - 0.5 < 0;
  });

  return new Query(arr, this.fields, this.parent);
};

Query.prototype.select = function(fields){
  if (!_.isArray(fields)) fields = _.toArray(arguments);
  return new Query(this.index, fields, this.parent);
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

  var index = [];

  for (var i=0, len=arr.length; i<len; i++){
    index.push(arr[i]._id);
  }

  return new Query(index, this.fields, this.parent);
};

Query.prototype.update = function(obj){
  this.parent.update(this.index, obj);
  return this;
};

Query.prototype.remove = function(){
  for (var i=0, len=this.length; i<len; i++){
    delete this.parent.store[this.index[i]];
  }
  return this;
};