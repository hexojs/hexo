'use strict';

var _ = require('lodash');

function postGenerator(locals){
  var posts = locals.posts.sort('-date').toArray();
  var length = posts.length;

  return posts.map(function(post, i){
    var layout = post.layout;
    var path = post.path;

    if (!layout || layout === 'false'){
      return {
        path: path,
        data: post.content
      };
    } else {
      if (i) post.prev = posts[i - 1];
      if (i < length - 1) post.next = posts[i + 1];

      var layouts = ['post', 'page', 'index'];
      if (layout !== 'post') layouts.unshift(layout);

      return {
        path: path,
        layout: layouts,
        data: _.extend({
          __post: true
        }, post)
      };
    }
  });
}

module.exports = postGenerator;