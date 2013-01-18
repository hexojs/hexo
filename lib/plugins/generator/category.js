var paginator = require('./paginator'),
  extend = require('../../extend'),
  route = require('../../route');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config.category;

  if (!config) return callback();

  locals.categories.each(function(item){
    var path = item.path;
    item.category = item.name;

    if (config == 2){
      paginator(path, item, 'category', render);
    } else {
      route.set(path, function(func){
        var result = render('category', item);
        if (!result) result = render('archive', item);
        if (!result) result = render('index', item);

        func(null, result);
      });
    }
  });

  callback();
});