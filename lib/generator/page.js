var async = require('async'),
  util = require('../util'),
  extend = require('../extend'),
  file = util.file;

extend.generate.register(function(locals, render, callback){
  var publicDir = hexo.public_dir;

  console.log('Generating pages.');

  async.forEach(locals.pages.toArray(), function(item, next){
    var layout = item.layout ? item.layout : 'page';

    render(layout, item, function(err, result){
      if (err){
        render('page', item, function(err, result){
          if (err) throw err;
          file.write(publicDir + item.permalink, result, next);
        });
      } else {
        file.write(publicDir + item.permalink, result, next);
      }
    });
  }, callback);
});