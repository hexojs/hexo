var paginator = require('./paginator'),
  extend = require('../extend'),
  route = require('../route');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config.tag;

  if (!config) return callback();

  locals.tags.each(function(item){
    var path = item.path;
    item.tag = item.name;

    if (config == 2){
      paginator(path, item, 'tag', render);
    } else {
      route.set(path, function(func){
        var result = render('tag', item);
        if (!result) result = render('archive', item);
        if (!result) result = render('index', item);

        func(null, result);
      });
    }
  });

  callback();
});