var paginator = require('./paginator'),
  extend = require('../extend'),
  async = require('async');

extend.generate.register(function(locals, render, callback){
  var config = hexo.config.category,
    categories = locals.categories,
    keys = Object.keys(categories);

  if (!config) return callback();

  async.forEach(keys, function(key, next){
    var item = categories[key];
    item.category = key;

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