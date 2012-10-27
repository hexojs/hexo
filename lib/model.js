var _ = require('underscore');

var Collection = function(arr){
  if (arr){
    var length = this.length = arr.length;

    for (var i=0; i<length; i++){
      this[i] = arr[i];
    }
  } else {
    this.length = 0;
  }
};

Collection.prototype.init = function(arr){
  return new Collection(arr);
};

Collection.prototype.each = Collection.prototype.forEach = function(iterator){
  for (var i=0, len=this.length; i<len; i++){
    var _iterator = iterator(this[i], i);

    if (typeof _iterator !== 'undefined'){
      if (_iterator){
        continue;
      } else {
        break;
      }
    }
  }
};

Collection.prototype.map = function(iterator){
  var arr = this.toArray();

  this.each(function(item, i){
    var _iterator = iterator(item, i);
    if (typeof _iterator !== 'undefined') arr[i] = _iterator;
  });

  return this.init(arr);
};

Collection.prototype.filter = Collection.prototype.select = function(iterator){
  var arr = [];

  this.each(function(item, i){
    var _iterator = iterator(item, i);
    if (_iterator) arr.push(item);
  });

  return this.init(arr);
};

Collection.prototype.toArray = function(){
  var result = [];

  this.each(function(item){
    result.push(item);
  });

  return result;
};

Collection.prototype.slice = function(start, end){
  return this.init([].slice.apply(this.toArray(), arguments));
};

Collection.prototype.skip = function(num){
  return this.slice(num);
};

Collection.prototype.limit = function(num){
  return this.slice(0, num);
};

Collection.prototype.set = Collection.prototype.push = function(item){
  this[this.length] = item;
  this.length++;
};

Collection.prototype.sort = function(orderby, order){
  var arr = this.toArray().sort(function(a, b){
    return a[orderby] - b[orderby];
  });

  if (order){
    order = order.toString();
    if (order == -1 || order.toLowerCase() === 'desc') arr = arr.reverse();
  }

  return this.init(arr);
};

Collection.prototype.reverse = function(){
  return this.init(this.toArray().reverse());
}

Collection.prototype.random = Collection.prototype.shuffle = function(){
  var arr = this.toArray().sort(function(a, b){
    return Math.random() - 0.5 < 0;
  });

  return this.init(arr);
};

var Taxonomy = function(obj){
  var index = {};

  if (_.isArray(obj)){
    var length = this.length = obj.length;

    for (var i=0; i<length; i++){
      var item = obj[i];
      index[item.name] = i;
      this[i] = item;
    }
  } else if (_.isObject(obj)){
    var keys = Object.keys(obj),
      length = this.length = keys.length;

    for (var i=0; i<length; i++){
      var item = obj[keys[i]],
        name = keys[i];

      item.name = name;
      index[name] = i;
      this[i] = item;
    }
  } else {
    this.length = 0;
  }

  this.index = index;
};

Taxonomy.prototype = new Collection();

Taxonomy.prototype.init = function(obj){
  return new Taxonomy(obj);
};

Taxonomy.prototype.get = function(name){
  return this[this.index[name]];
};

Taxonomy.prototype.set = Taxonomy.prototype.push = function(name, obj){
  obj.name = name;
  this[this.length] = obj;
  this.index[name] = this.length;
  this.length++;
};

Taxonomy.prototype.each = Taxonomy.prototype.forEach = function(iterator){
  var index = this.index;

  for (var i=0, len=this.length; i<len; i++){
    var _iterator = iterator(this[i], index[i], i);

    if (typeof _iterator !== 'undefined'){
      if (_iterator){
        continue;
      } else {
        break;
      }
    }
  }
};

Taxonomy.prototype.toObject = function(){
  var obj = {};

  this.each(function(item, key, i){
    obj[key] = item;
  });

  return obj;
};

Taxonomy.prototype.map = function(iterator){
  var obj = this.toObject();

  this.each(function(item, key, i){
    var _iterator = iterator(item, key, i);
    if (typeof _iterator !== 'undefined') obj[key] = _iterator;
  });

  return this.init(obj);
};

Taxonomy.prototype.filter = Taxonomy.prototype.select = function(iterator){
  var obj = {};

  this.each(function(item, key, i){
    var _iterator = iterator(item, key, i);
    if (_iterator) arr[key] = item;
  });

  return this.init(obj);
};

exports.Collection = Collection;
exports.Taxonomy = Taxonomy;