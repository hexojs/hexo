var async = require('async'),
  util = require('../util'),
  extend = require('../extend'),
  file = util.file;

extend.generate.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  async.forEach(locals.pages.toArray(), function(item, next){
    render('page', item, function(err, result){
      if (err) throw err;
      file.write(publicDir + item.permalink, result, next);
    });
  }, function(err){
    if (err) throw err;
    callback();
  });
});