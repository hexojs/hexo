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

  if (typeof order !== 'undefined' && (order === -1 || order.toLowerCase() === 'desc')){
    arr = arr.reverse();
  }

  return this.init(arr);
};

Collection.prototype.reverse = function(){
  return this.init(this.toArray().reverse());
}

Collection.prototype.random = function(){
  var arr = this.toArray().sort(function(a, b){
    return Math.random() - 0.5 < 0;
  });

  return this.init(arr);
};

var Taxonomy = function(obj){
  if (obj){
    var keys = Object.keys(obj),
      length = this.length = keys.length,
      index = {};

    for (var i=0; i<length; i++){
      var item = obj[keys[i]],
        name = keys[i];

      item.name = name;
      index[name] = i;
      this[i] = item;
    }

    this.index = index;
  } else {
    this.length = 0;
    this.index = {};
  }
};

Taxonomy.prototype = new Collection();

Taxonomy.prototype.init = function(obj){
  return new Taxonomy(obj);
};

Taxonomy.prototype.get = function(str){
  return this[this.index[str]];
};

Taxonomy.prototype.set = Taxonomy.prototype.push = function(name, obj){
  obj.name = str;
  this[this.length] = obj;
  this.index[name] = this.length;
  this.length++;
};

exports.Collection = Collection;
exports.Taxonomy = Taxonomy;