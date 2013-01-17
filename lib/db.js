var _ = require('underscore');

var Database = module.exports = function(source){
  this._ = {
    source: source || ''
  };

  try {
    var obj = require(source);

    _.each(obj, function(val, key){
      obj[key] = val;
    });
  } catch (err){
  }
};

Database.prototype.collection = function(name){
  var table = this[name];
  if (!table) table = this[name] = new Collection(name, this);
  return table;
};

var Collection = function(name, parent){
  this._ = {
    index: 1,
    parent: parent,
    name: name
  };

  this.length = 0;
};

Collection.prototype.insert = function(obj){
  if (!_.isArray(obj)) obj = [obj];

  var length = obj.length,
    index = this._.index;

  for (var i=0; i<length; i++){
    var item = obj[i],
      id = item._id = index + i;

    this[id] = item;
  }

  this._.index += length;
  this.length += length;

  return this;
};

Collection.prototype.forEach = Collection.prototype.each = function(iterator){
  for (var i=0, len=this.length; i<len; i++){
    iterator(this[i], this[i]._id);
  }
};

Collection.prototype.map = function(iterator){
  this.each(function(item, i){
    this[i] = iterator(item, i);
  });

  return this;
};

Collection.prototype.reduce = function(iterator){

};

Collection.prototype.toArray = function(){
  var result = [];

  this.each(function(item){
    result.push(item);
  });

  return result;
};

Collection.prototype.get = function(id){
  return this[id];
};

Collection.prototype.find = function(query){
  var query = new Query(query, this),
    length = query.length = 0;

  this.each(function(item, id){
    var match = true;

    _.each(query, function(qVal, qKey){
      var splits = qKey.split('.'),
        cursor = item;

      splits.forEach(function(split){
        cursor = cursor[split];
      });

      if (_.isRegExp(qVal)){
        if (!cursor.match(qVal)) match = false;
      } else {
        if (cursor !== qVal) match = false;
      }
    });

    if (match){
      query[id] = item;
      length++;
    }
  });

  return query;
};

Collection.prototype.findOne = function(query){
  return this.find(query)[0];
};

Collection.prototype.destroy = function(){
  delete this._.parent[this._.name];
};

var Query = function(query, parent){
  this._ = {
    query: query,
    parent: parent
  };

  this.forEach = this.each = parent.each;
  this.map = parent.map;
  this.reduce = parent.reduce;
  this.get = parent.get;
  this.find = parent.find;
  this.findOne = parent.findOne;
  this.toArray = parent.toArray;
};

Query.prototype.init = function(arr){
  var query = new Query(this._.query, this._.parent);

  arr.forEach(function(item){
    query[item._id] = item;
  });

  query.length = arr.length;

  return query;
};

Query.prototype.select = function(fields){
  if (!_.isArray(fields)) fields = [fields];

  var arr = this.toArray();

  arr = _.map(arr, function(item){
    var obj = {_id: item._id};

    fields.forEach(function(field){
      var splits = field.split('.'),
        lastSplit = splits.pop(),
        getter = item,
        target = obj;

      splits.forEach(function(split){
        getter = getter[split];
        target = target[split] = target[split] || {};
      });

      target[lastSplit] = getter[lastSplit];
    });

    return obj;
  });

  return this.init(arr);
};

Query.prototype.slice = function(start, end){
  return this.init([].slice.apply(this.toArray(), arguments));
};

Query.prototype.limit = function(num){
  return this.slice(num);
};

Query.prototype.skip = function(num){
  return this.slice(0, num);
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

  return this.init(arr);
};

Query.prototype.reverse = function(){
  return this.init(this.toArray().reverse());
};

Query.prototype.random = Query.prototype.shuffle = function(){
  var arr = this.toArray().sort(function(a, b){
    return Math.random() - 0.5 < 0;
  });

  return this.init(arr);
};

Query.prototype.destroy = function(){
  this.each(function(item, id){
    delete this._.parent[id];
  });
};