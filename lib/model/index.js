var schemas = require('./schema');

/**
* This module is used to manage all models used in Hexo.
*
* @class Model
* @param {Warehouse} db
* @constructor
* @namespace Hexo
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
  * @param {Object} [method]
  *   @param {Object} [method.statics] Static methods for the model
  *   @param {Object} [method.methods] Instance methods for the model
  *   @param {Object} [method.hooks] Model hooks
  */

  model.register = function(name, method){
    var schema = schemas[name] || {};

    if (method){
      if (method.hooks){
        if (method.hooks.pre) schema.pres = method.hooks.pre;
        if (method.hooks.post) schema.posts = method.hooks.post;
      }

      if (method.statics) schema.statics = method.statics;
      if (method.methods) schema.methods = method.methods;

      var model = db.model(name, schema);
    } else {
      var model = db.model(name, schema);
    }

    models[name] = model;
  }

  return model;
};