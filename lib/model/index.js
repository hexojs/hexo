var _ = require('lodash'),
  Database = require('warehouse'),
  db = new Database(),
  schema = require('./schema')(db.Schema),
  store = {};

var model = module.exports = function(name){
  return store[name];
};

model.extend = function(name, obj){
  var model = db.model(name, schema[name]);

  store[name] = _.extend(model, obj);
};