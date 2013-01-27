var extend = require('../../extend'),
  route = require('../../route'),
  paginator = require('./paginator');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config.tag;

  if (!config) return callback();

  locals.categories.each(function(cat){
    var posts = cat.posts.sort('date', -1),
      arr = posts.toArray(),
      isUpdated = false;

    for (var i=0, len=arr.length; i<len; i++){
      if (arr[i].isUpdated){
        isUpdated = true;
        break;
      }
    }

    if (isUpdated){
      var path = cat.path;
      posts.category = cat.name;

      if (config == 2){
        paginator(path, posts, 'category', render);
      } else {
        route.set(path, function(fn){
          var result = render('category', item);
          if (!result) result = render('archive', item);
          if (!result) result = render('index', item);

          fn(null, result);
        });
      }
    }
  });

  callback();
});