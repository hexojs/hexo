var extend = require('../extend'),
  render = extend.render.list(),
  article = require('../article'),
  util = require('../util'),
  file = util.file,
  path = require('path'),
  async = require('async'),
  _ = require('underscore');

extend.process.register(function(locals, callback){
  var source = hexo.source_dir;

  file.dir(source, function(files){
    async.forEach(files, function(item, next){
      var extname = path.extname(item),
        dirs = item.split('/');

      if (dirs[0] === '_posts'){
        var category = dirs.slice(1);

        for (var i=0, len=category.length; i<len; i++){
          var front = category[i].substring(0, 1);

          if (front === '_' || front === '.'){
            return next();
          }
        }

        if (_.indexOf(render, extname.substring(1))){
          article.loadPost(source + item, category.reverse().slice(1).reverse().join('/'), function(post){
            locals.posts.push(post);
            next();
          });
        } else {
          next();
        }
      } else {
        for (var i=0, len=dirs.length; i<len; i++){
          var front = dirs[i].substring(0, 1);

          if (front === '_' || front === '.'){
            return next();
          }
        }

        if (_.indexOf(render, extname.substring(1))){
          article.loadPage(source + item, item, function(page){
            locals.pages.push(page);
            next();
          });
        } else {
          file.copy(source + item, hexo.public_dir + item, next);
        }
      }
    }, function(err){
      console.log('Source file loaded.');
      callback(err, locals);
    });
  });
});