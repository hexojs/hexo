var extend = require('../../extend'),
  route = require('../../route'),
  paginator = require('./paginator');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config.category;

  if (!config){
    if (config == 0 || config === false){
      return callback();
    } else {
      config = 2;
    }
  }

  locals.categories.each(function(cat){
    var posts = cat.posts.sort('date', -1),
      path = cat.path;

    posts.category = cat.name;

    if (config == 2){
      paginator(path, posts, 'category', render);
    } else {
      route.set(path, function(fn){
        var result = render('category', posts);
        if (!result) result = render('archive', posts);
        if (!result) result = render('index', posts);

        fn(null, result);
      });
    }
  });

  callback();
});