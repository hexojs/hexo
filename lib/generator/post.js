var async = require('async'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file;

extend.generator.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  async.forEach(locals.posts.toArray(), function(item, next){
    render('post', item, function(err, result){
      if (err) throw err;
      file.write(publicDir + item.permalink + '/index.html', result, next);
    });
  }, function(err){
    if (err) throw err;
    callback();
  });
});