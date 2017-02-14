'use strict';

function postGenerator(locals) {
  var posts = locals.posts.sort('date').toArray();
  var length = posts.length;

  return posts.map(function(post, i) {
    var layout = post.layout;
    var path = post.path;

    if (!layout || layout === 'false') {
      return {
        path: path,
        data: post.content
      };
    }

    if (i) post.prev = posts[i - 1];
    if (i < length - 1) post.next = posts[i + 1];

    var layouts = ['post', 'page', 'index'];
    if (layout !== 'post') layouts.unshift(layout);

    post.__post = true;

    return {
      path: path,
      layout: layouts,
      data: post
    };
  });
}

module.exports = postGenerator;
