var route = require('../../route'),
  extend = require('../../extend');

extend.generator.register(function(locals, render, callback){
  locals.pages.each(function(item){
    var layout = item.layout;
    render(item.path, [layout, 'page', 'index'], item);
  });

  callback();
});