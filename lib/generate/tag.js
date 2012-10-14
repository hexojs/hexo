var paginator = require('./paginator'),
  extend = require('../extend'),
  async = require('async');

extend.generate.register(function(locals, render, callback){
  var config = hexo.config.tag,
    tags = locals.tags,
    keys = Object.keys(tags);

  if (!config) return callback();

  async.forEach(keys, function(key, next){
    var item = tags[key];
    item.tag = key;

    if (config === 2){
      paginator(item.permalink, item, 'tag', render, next);
    } else {
      render('tag', item, function(err, result){
        if (err) throw err;
        file.write(publicDir + item.permalink + 'index.html', result, next);
      });
    }
  }, callback);
});