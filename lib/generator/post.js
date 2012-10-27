var async = require('async'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file;

extend.generate.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  console.log('Generating posts.');

  async.forEach(locals.posts.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'post';

    render(layout, item, function(err, result){
      if (err){
        render('post', item, function(err, result){
          if (err) throw err;
          file.write(publicDir + item.permalink + 'index.html', result, next);
        });
      } else {
        file.write(publicDir + item.permalink + 'index.html', result, next);
      }
    });
  }, callback);
});