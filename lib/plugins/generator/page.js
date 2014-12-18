module.exports = function(locals, render){
  var route = this.route;

  locals.pages.forEach(function(item){
    var layout = item.layout;
    var path = item.path;

    if (!layout || layout === 'false'){
      route.set(path, item.content);
    } else {
      var layouts = ['page', 'post', 'index'];
      if (layout !== 'page') layouts.unshift(layout);

      render(path, layouts, item);
    }
  });
};