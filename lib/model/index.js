var schemas = require('./schema');

var Model = module.exports = function(db){
  var model = function(name, method){
    if (method){
      var schema = schemas[name];

      if (method.hooks){
        if (method.hooks.pre) schema.pres = method.hooks.pre;
        if (method.hooks.post) schema.posts = method.hooks.post;
      }

      if (method.statics) schema.statics = method.statics;
      if (method.methods) schema.methods = method.methods;

      return db.model(name, schema);
    } else {
      return db.model(name);
    }
  };

  return model;
};