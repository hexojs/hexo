var _ = require('underscore'),
  Collection = require('./collection'),
  Schema = require('./schema'),
  Query = require('./query');

module.exports = function Database(){
  this.store = {};
  this.raw = {};
};

Database.prototype.collection = function(name, schema){
  var store = this.store[name] = this.store[name] || new Collection(name, schema, this, this.raw[name]);
  return store;
};

Database.prototype.import = function(source){
  this.raw = source;
};

Database.prototype.export = function(){
  var result = {};

  _.each(this.store, function(collection, name){
    var obj = result[name] = {_: {primary: collection.primary}};
    collection.each(function(item, i){
      var item = obj[i] = collection.schema.save(collection.store[i]);
      delete item._id;
    });
  });

  _.each(this.raw, function(val, key){
    result[key] = val;
  });

  return result;
};

Database.prototype.toJSON = function(){
  var result = {};

  _.each(this.store, function(collection, name){
    result[name] = collection.toJSON();
  });

  return result;
};

Database.prototype.stringify = function(){
  return JSON.stringify(this.toJSON());
};

Database.prototype.Schema = Schema;
Database.prototype.Query = Query;