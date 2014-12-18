module.exports = function(locals, render){
  var route = this.route;
  var posts = locals.posts.sort('-date').toArray();
  var length = posts.length;

  posts.forEach(function(post, i){
    var layout = post.layout;
    var path = post.path;

    if (!layout || layout === 'false'){
      route.set(path, post.content);
    } else {
      post.prev = i === 0 ? null : posts[i - 1];
      post.next = i === length - 1 ? null : posts[i + 1];

      var layouts = ['post', 'page', 'index'];
      if (layout !== 'post') layouts.unshift(layout);

      render(path, layouts, post);
    }
  });
};