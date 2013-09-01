var schemas = require('./schema');

var Model = module.exports = function(db){
  var models = {};

  var model = function(name){
    return models[name];
  };

  model.register = function(name, method){
    if (method){
      var schema = schemas[name] || {};

      if (method.hooks){
        if (method.hooks.pre) schema.pres = method.hooks.pre;
        if (method.hooks.post) schema.posts = method.hooks.post;
      }

      if (method.statics) schema.statics = method.statics;
      if (method.methods) schema.methods = method.methods;

      var model = db.model(name, schema);
    } else {
      var model = db.model(name);
    }

    models[name] = model;
  }

  return model;
};