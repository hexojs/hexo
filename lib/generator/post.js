var async = require('async'),
  extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  async.forEach(locals.posts.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'post',
      path = item.path;

    route.set(path, function(func){
      var result = render(layout, path, item);
      if (!result && layout !== 'post') result = render('post', path, item);
      if (!result) result = render('index', path, item);

      func(null, result);
    });

    next();
  }, callback);
});