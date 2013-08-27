var route = hexo.route,
  config = hexo.config;

module.exports = function(locals, render, callback){
  if (config.exclude_generator && config.exclude_generator.indexOf('page') > -1) return callback();

  locals.pages.each(function(item){
    var layout = item.layout,
      path = item.path;

    if (!layout || layout === 'false'){
      route.set(item.path, function(fn){
        fn(null, item.content);
      });
    } else {
      render(item.path, [layout, 'page', 'index'], item);
    }
  });

  callback();
};