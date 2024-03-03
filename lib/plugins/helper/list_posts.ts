import { url_for } from 'hexo-util';
import type { LocalsType, PostSchema } from '../../types';
import type Query from 'warehouse/dist/query';

interface Options {
  style?: string | false;
  class?: string;
  amount?: number;
  orderby?: string;
  order?: number;
  transform?: (name: string) => string;
  separator?: string;
}

function listPostsHelper(this: LocalsType, posts?: Query<PostSchema> | Options, options?: Options) {
  if (!options && (!posts || !Object.prototype.hasOwnProperty.call(posts, 'length'))) {
    options = posts as Options;
    posts = this.site.posts;
  }

  posts = posts as Query<PostSchema>;

  options = options || {};

  const { style = 'list', transform, separator = ', ' } = options;
  const orderby = options.orderby || 'date';
  const order = options.order || -1;
  const className = options.class || 'post';
  const amount = options.amount || 6;

  // Sort the posts
  posts = posts.sort(orderby, order);

  // Limit the number of posts
  if (amount) posts = posts.limit(amount);

  let result = '';

  if (style === 'list') {
    result += `<ul class="${className}-list">`;

    posts.forEach(post => {
      const title = post.title || post.slug;

      result += `<li class="${className}-list-item">`;

      result += `<a class="${className}-list-link" href="${url_for.call(this, post.path)}">`;
      result += transform ? transform(title) : title;
      result += '</a>';

      result += '</li>';
    });

    result += '</ul>';
  } else {
    posts.forEach((post, i) => {
      if (i) result += separator;

      const title = post.title || post.slug;

      result += `<a class="${className}-link" href="${url_for.call(this, post.path)}">`;
      result += transform ? transform(title) : title;
      result += '</a>';
    });
  }

  return result;
}

export = listPostsHelper;
