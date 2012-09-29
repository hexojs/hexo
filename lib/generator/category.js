var paginator = require('./paginator'),
  extend = require('../extend'),
  async = require('async');

extend.generator.register(function(locals, render, callback){
  var categories = locals.categories,
    keys = Object.keys(categories);

  async.forEach(keys, function(key, next){
    var item = categories[key];
    paginator(item.permalink + '/', item, 'category', render, next);
  }, callback);
});