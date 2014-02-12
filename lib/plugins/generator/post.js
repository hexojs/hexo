module.exports = function(locals, render, callback){
  var config = hexo.config,
    route = hexo.route;

  if (config.exclude_generator && config.exclude_generator.indexOf('post') > -1) return callback();

  var sort_by = (config.sort_by == 'date') ? 'date' : 'updated';
  var arr = locals.posts.sort(sort_by, -1).toArray(),
    length = arr.length;

  arr.forEach(function(post, i){
    var layout = post.layout,
      path = post.path;

    if (!layout || layout === 'false'){
      route.set(path, function(fn){
        fn(null, post.content);
      });
    } else {
      post.prev = i === 0 ? null : arr[i - 1];
      post.next = i === length - 1 ? null : arr[i + 1];

      render(path, [layout, 'post', 'page', 'index'], post);
    }
  });

  callback();
};
