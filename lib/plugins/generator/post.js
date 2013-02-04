var extend = require('../../extend'),
  route = require('../../route');

extend.generator.register(function(locals, render, callback){
  locals.posts.each(function(item){
    var layout = item.layout;

    var content = function(fn){
      var result = render(layout, item);
      if (!result && layout !== 'post') result = render('post', item);
      if (!result) result = render('index', item);

      fn(null, result);
    };
    content._latest = item._latest;
    route.set(item.path, content);
  });

  callback();
});