var _ = require('underscore');

function Single(){
  //
};

Single.prototype.prev = function(){
  var parent = this._parent,
    index = parent.index,
    pos = index.indexOf(this._id);

  return pos == 0 ? undefined : parent.get(index[pos - 1]);
};

Single.prototype.next = function(){
  var parent = this._parent,
    index = parent.index,
    pos = index.indexOf(this._id);

  return pos == parent.length ? undefined : parent.get(index[pos + 1]);
};

Single.prototype.update = function(obj){
  this._parent.update(this._id, obj);
  return this;
};

Single.prototype.remove = function(){
  this._parent.remove(this._id);
};

module.exports = function(obj, parent){
  var obj = _.clone(obj);

  obj.__proto__ = Single.prototype;
  Object.defineProperty(obj, '_parent', {
    enumerable: false,
    value: parent
  });

  return obj;
};