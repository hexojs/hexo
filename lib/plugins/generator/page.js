module.exports = function(locals, render, callback){
  var route = hexo.route;

  locals.pages.each(function(item){
    var layout = item.layout,
      path = item.path;

    if (!layout || layout === 'false'){
      route.set(item.path, function(fn){
        fn(null, item.content);
      });
    } else {
      render(item.path, [layout, 'page', 'post', 'index'], item);
    }
  });

  callback();
};