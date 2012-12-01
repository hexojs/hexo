var async = require('async'),
  path = require('path'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  console.log('Generating posts.');

  async.forEach(locals.posts.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'post',
      link = item.path,
      permalink = publicDir + link + (path.extname(link) ? '' : 'index.html');

    var result = render(layout, item);
    if (!result) result = render('post', item);
    if (!result) result = render('index', item);

    file.write(permalink, result, next);
  }, callback);
});