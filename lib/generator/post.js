var async = require('async'),
  path = require('path'),
  extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  console.log('Generating posts.');

  async.forEach(locals.posts.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'post';

    route.set(item.path, function(func){
      var result = render(layout, item);
      if (!result) result = render('post', item);
      if (!result) result = render('index', item);

      func(null, result);
    });

    next();
  }, callback);
});