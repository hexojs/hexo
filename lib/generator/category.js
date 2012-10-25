var paginator = require('./paginator'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  async = require('async');

extend.generate.register(function(locals, render, callback){
  var config = hexo.config.category,
    categories = locals.categories,
    publicDir = hexo.public_dir;

  if (!config) return callback();

  async.forEach(categories.toArray(), function(item, next){
    item.category = item.name;

    if (config === 2){
      paginator(item.permalink, item, 'category', render, next);
    } else {
      render('category', item, function(err, result){
        if (err) throw err;
        file.write(publicDir + item.permalink + 'index.html', result, next);
      });
    }
  }, function(){
    console.log('Category archives generated.');
    callback();
  });
});