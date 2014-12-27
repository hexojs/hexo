function pageGenerator(locals){
  return locals.pages.map(function(page){
    var layout = page.layout;
    var path = page.path;

    if (!layout || layout === 'false'){
      return {
        path: path,
        data: page.content
      };
    } else {
      var layouts = ['page', 'post', 'index'];
      if (layout !== 'page') layouts.unshift(layout);

      return {
        path: path,
        layout: layouts,
        data: page
      };
    }
  });
}

module.exports = pageGenerator;