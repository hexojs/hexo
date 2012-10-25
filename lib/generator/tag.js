var paginator = require('./paginator'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  async = require('async');

extend.generate.register(function(locals, render, callback){
  var config = hexo.config.tag,
    tags = locals.tags,
    publicDir = hexo.public_dir;

  if (!config) return callback();

  async.forEach(tags.toArray(), function(item, next){
    item.tag = item.name;

    if (config === 2){
      paginator(item.permalink, item, 'tag', render, next);
    } else {
      render('tag', item, function(err, result){
        if (err) throw err;
        file.write(publicDir + item.permalink + 'index.html', result, next);
      });
    }
  }, function(){
    console.log('Tag archives generated.');
    callback();
  });
});