var extend = require('../../extend'),
  route = require('../../route');

extend.generator.register(function(locals, render, callback){
  locals.posts.each(function(item){
    var layout = item.layout;

    route.set(item.path, function(fn){
      render([layout, 'post', 'index'], item, fn);
    });
  });

  callback();
});