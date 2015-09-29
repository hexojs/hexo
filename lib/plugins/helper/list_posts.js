'use strict';

function listPostsHelper(posts, options) {
  if (!options && (!posts || !posts.hasOwnProperty('length'))) {
    options = posts;
    posts = this.site.posts;
  }

  options = options || {};

  var style = options.hasOwnProperty('style') ? options.style : 'list';
  var orderby = options.orderby || 'date';
  var order = options.order || -1;
  var className = options.class || 'post';
  var transform = options.transform;
  var separator = options.hasOwnProperty('separator') ? options.separator : ', ';
  var amount = options.amount || 6;
  var result = '';
  var self = this;

  // Sort the posts
  posts = posts.sort(orderby, order);

  // Limit the number of posts
  if (amount) posts = posts.limit(amount);

  if (style === 'list') {
    result += '<ul class="' + className + '-list">';

    posts.forEach(function(post) {
      var title = post.title || post.slug;

      result += '<li class="' + className + '-list-item">';

      result += '<a class="' + className + '-list-link" href="' + self.url_for(post.path) + '">';
      result += transform ? transform(title) : title;
      result += '</a>';

      result += '</li>';
    });

    result += '</ul>';
  } else {
    posts.forEach(function(post, i) {
      if (i) result += separator;

      var title = post.title || post.slug;

      result += '<a class="' + className + '-link" href="' + self.url_for(post.path) + '">';
      result += transform ? transform(title) : title;
      result += '</a>';
    });
  }

  return result;
}

module.exports = listPostsHelper;
