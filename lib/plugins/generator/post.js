var extend = require('../../extend'),
  route = require('../../route');

extend.generator.register(function(locals, render, callback){
  locals.posts.each(function(item){
    if (!item._latest || hexo.cache.rebuild){
      var layout = item.layout;

      route.set(item.path, function(fn){
        var result = render(layout, item);
        if (!result && layout !== 'post') result = render('post', item);
        if (!result) result = render('index', item);

        fn(null, result);
      });
    }
  });

  callback();
});