var route = require('../../route'),
  extend = require('../../extend');

extend.generator.register(function(locals, render, callback){
  locals.pages.each(function(item){
    var layout = item.layout;

    route.set(item.path, function(fn){
      render([layout, 'page', 'index'], item, fn);
    });
  });

  callback();
});