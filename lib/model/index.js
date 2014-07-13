/**
* This module is used to manage all models used in Hexo.
*
* @class Model
* @param {Warehouse} db
* @constructor
* @module hexo
*/

var Model = module.exports = function(db){
  var models = {};

  var model = function(name){
    return models[name];
  };

  /**
  * Register a model.
  *
  * @method register
  * @param {String} name Model name. The model name should be written in CamelCase.
  * @param {Schema} [schema] Model schema.
  * @param {Object} [method]
  *   @param {Object} [method.statics] Static methods for the model
  *   @param {Object} [method.methods] Instance methods for the model
  *   @param {Object} [method.hooks] Model hooks
  */

  model.register = function(name, schema, method){
    if (!schema) schema = {};

    var model;

    if (method){
      if (method.hooks){
        if (method.hooks.pre) schema.pres = method.hooks.pre;
        if (method.hooks.post) schema.posts = method.hooks.post;
      }

      if (method.statics) schema.statics = method.statics;
      if (method.methods) schema.methods = method.methods;

      model = db.model(name, schema);
    } else {
      model = db.model(name, schema);
    }

    models[name] = model;
  };

  /**
  * Save database.
  *
  * @method save
  * @param {String} dest
  * @param {Function} callback
  */
  model.save = db.save.bind(db);

  /**
  * @property Schema
  * @type Schema
  * @static
  */

  model.Schema = require('warehouse').Schema;

  return model;
};