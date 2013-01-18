var extend = require('../../extend'),
  route = require('../../route');

extend.generator.register(function(locals, render, callback){
  locals.posts.each(function(item, i){
    var layout = item.layout ? item.layout : 'post',
      path = item.path;

    route.set(path, function(func){
      var result = render(layout, item);
      if (!result && layout !== 'post') result = render('post', item);
      if (!result) result = render('index', item);

      func(null, result);
    });
  });

  callback();
});