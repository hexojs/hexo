var paginator = require('./paginator'),
  extend = require('../extend'),
  async = require('async');

extend.generate.register(function(locals, render, callback){
  var tags = locals.tags,
    keys = Object.keys(tags);

  async.forEach(keys, function(key, next){
    var item = tags[key];
    paginator(item.permalink + '/', item, 'tag', render, next);
  }, callback);
});