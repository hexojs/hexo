/**
 * Module dependencies.
 */

var _ = require('lodash'),
  Database = require('warehouse'),
  db = new Database(hexo.base_dir + 'db.json'),
  schema = require('./schema')(db.Schema);

/**
 * Craete a object to store the model in use.
 */

var store = {};

/**
 * Get the model for the given `name`.
 *
 * @param {String} name
 * @return {Model}
 * @api public
 */

var model = module.exports = function(name){
  return store[name];
};

/**
 * Register a new model.
 *
 * @param {String} name
 * @param {Object} obj
 * @api public
 */

model.extend = function(name, obj){
  var model = db.model(name.toLowerCase(), schema[name]);

  store[name] = _.extend(model, obj);
};