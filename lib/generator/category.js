var paginator = require('./paginator'),
  extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  async = require('async');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config.category;

  if (!config) return callback();

  async.forEach(locals.categories.toArray(), function(item, next){
    var path = item.path;

    item.category = item.name;

    if (config == 2){
      paginator(path, item, 'category', render, next);
    } else {
      route.set(path, function(func){
        var result = render('category', path, item);
        if (!result) result = render('archive', path, item);
        if (!result) result = render('index', path, item);

        func(null, result);
      });

      next();
    }
  }, callback);
});