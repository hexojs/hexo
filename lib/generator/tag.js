var paginator = require('./paginator'),
  extend = require('../extend'),
  async = require('async');

extend.generate.register(function(locals, render, callback){
  var config = hexo.config.tag,
    tags = locals.tags;

  if (!config) return callback();

  async.forEach(tags.toArray(), function(item, next){
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