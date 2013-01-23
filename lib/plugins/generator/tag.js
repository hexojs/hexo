var extend = require('../../extend'),
  route = require('../../route'),
  paginator = require('./paginator');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config.tag;

  if (!config) return callback();

  locals.tags.each(function(item){
    var path = item.path;
    item.tag = item.name;
    item.posts = item.posts.sort('date', -1);

    if (config == 2){
      paginator(path, item, 'tag', render);
    } else {
      route.set(path, function(fn){
        var result = render('tag', item);
        if (!result) result = render('archive', item);
        if (!result) result = render('index', item);

        fn(null, result);
      });
    }
  });

  callback();
});