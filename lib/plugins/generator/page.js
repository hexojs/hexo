var route = require('../../route'),
  extend = require('../../extend');

extend.generator.register(function(locals, render, callback){
  locals.pages.each(function(item){
    var layout = item.layout;

    if (layout === 'false'){
      route.set(item.path, function(fn){
        fn(null, item.content);
      });
    } else {
      render(item.path, [layout, 'page', 'index'], item);
    }
  });

  callback();
});