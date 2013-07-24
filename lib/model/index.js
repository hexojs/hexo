/**
 * Module dependencies.
 */

var _ = require('lodash'),
  Database = require('warehouse'),
  db = new Database(hexo.base_dir + 'db.json'),
  schema = require('./schema')(db.Schema);

/**
 * Stores models.
 */

var store = {};

/**
 * Gets the specified model.
 *
 * @param {String} name
 * @return {Model}
 * @api public
 */

var model = module.exports = function(name){
  return store[name];
};

/**
 * Registers a new model.
 *
 * @param {String} name
 * @param {Object} obj
 * @api public
 */

model.extend = function(name, obj){
  var model = db.model(name.toLowerCase(), schema[name]);

  store[name] = _.extend(model, obj);
};