var extend = require('../../extend'),
  route = require('../../route'),
  paginator = require('./paginator');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config.category;

  if (!config) return callback();

  locals.categories.each(function(cat){
    var posts = cat.posts.sort('date', -1),
      arr = posts.toArray(),
      latest = true;

    for (var i=0, len=arr.length; i<len; i++){
      if (!arr[i]._latest){
        latest = false;
        break;
      }
    }

    if (!latest || hexo.cache.rebuild){
      var path = cat.path;
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
    }
  });

  callback();
});