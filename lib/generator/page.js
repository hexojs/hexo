var async = require('async'),
  route = require('../route'),
  util = require('../util'),
  extend = require('../extend'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  async.forEach(locals.pages.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'page',
      path = item.path;

    route.set(path, function(func){
      var result = render(layout, path, item);
      if (!result && layout !== 'page') result = render('page', path, item);
      if (!result) result = render('index', path, item);

      func(null, result);
    });

    next();
  }, callback);
});