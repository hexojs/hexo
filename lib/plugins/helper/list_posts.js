'use strict';

function listPostsHelper(posts, options) {
  if (!options && (!posts || !posts.hasOwnProperty('length'))) {
    options = posts;
    posts = this.site.posts;
  }

  options = options || {};

  const style = options.hasOwnProperty('style') ? options.style : 'list';
  const orderby = options.orderby || 'date';
  const order = options.order || -1;
  const className = options.class || 'post';
  const transform = options.transform;
  const separator = options.hasOwnProperty('separator') ? options.separator : ', ';
  const amount = options.amount || 6;
  let result = '';
  const self = this;

  // Sort the posts
  posts = posts.sort(orderby, order);

  // Limit the number of posts
  if (amount) posts = posts.limit(amount);

  if (style === 'list') {
    result += `<ul class="${className}-list">`;

    posts.forEach(post => {
      const title = post.title || post.slug;

      result += `<li class="${className}-list-item">`;

      result += `<a class="${className}-list-link" href="${self.url_for(post.path)}">`;
      result += transform ? transform(title) : title;
      result += '</a>';

      result += '</li>';
    });

    result += '</ul>';
  } else {
    posts.forEach((post, i) => {
      if (i) result += separator;

      const title = post.title || post.slug;

      result += `<a class="${className}-link" href="${self.url_for(post.path)}">`;
      result += transform ? transform(title) : title;
      result += '</a>';
    });
  }

  return result;
}

module.exports = listPostsHelper;
