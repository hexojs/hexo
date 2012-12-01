var async = require('async'),
  util = require('../util'),
  extend = require('../extend'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  console.log('Generating pages.');

  async.forEach(locals.pages.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'page',
      permalink = publicDir + item.path;

    var result = render(layout, item);
    if (!result) result = render('page', item);
    if (!result) result = render('index', item);

    file.write(permalink, result, next);
  }, callback);
});