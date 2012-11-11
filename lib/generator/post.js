var async = require('async'),
  path = require('path'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  var publicDir = hexo.public_dir,
    linkExt = path.extname(hexo.config.permalink);

  console.log('Generating posts.');

  async.forEach(locals.posts.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'post',
      permalink = publicDir + item.permalink + (linkExt ? '' : 'index.html');

    render(layout, item, function(err, result){
      if (err){
        render('post', item, function(err, result){
          if (err) throw err;
          file.write(permalink, result, next);
        });
      } else {
        file.write(permalink, result, next);
      }
    });
  }, callback);
});