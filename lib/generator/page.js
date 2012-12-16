var async = require('async'),
  route = require('../route'),
  util = require('../util'),
  extend = require('../extend'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  async.forEach(locals.pages.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'page';

    route.set(item.path, function(func){
      var result = render(layout, item);
      if (!result) result = render('page', item);
      if (!result) result = render('index', item);

      func(null, result);
    });

    next();
  }, callback);
});