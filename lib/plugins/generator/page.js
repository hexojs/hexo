var route = require('../../route'),
  extend = require('../../extend');

extend.generator.register(function(locals, render, callback){
  locals.pages.each(function(item, i){
    var layout = item.layout;

    route.set(item.path, function(fn){
      var result = render(layout, item);
      if (!result && layout !== 'page') result = render('page', item);
      if (!result) result = render('index', item);

      fn(null, result);
    });
  });

  callback();
});