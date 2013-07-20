/**
 * Module dependencies.
 */

var config = hexo.config,
  root = config.root,
  perPage = config.per_page,
  pageDir = config.pagination_dir;

/**
 * Return pagination URL.
 *
 * @param {String} base
 * @param {Number} i
 * @return {String}
 * @api private
 */

var format = function(base, i){
  return base + (i == 1 ? '' : pageDir + '/' + i + '/');
};

/**
 * Create a new Paginator instance.
 *
 * @param {String} base
 * @param {Model} posts
 * @param {Number} num
 * @param {Number} total
 * @api private
 */

var Paginator = function(base, posts, num, total){
  this.base = root + base;
  this.per_page = perPage;
  this.total = total;
  this.current = num;
  this.current_url = format(base, num);
  this.posts = posts.slice(perPage * (num - 1), perPage * num);

  this.archive = posts.archive || false;
  this.year = posts.year || null;
  this.month = posts.month || null;
  this.category = posts.category || null;
  this.tag = posts.tag || '';

  if (num == 1){
    this.prev = 0;
    this.prev_link = '';
  } else {
    this.prev = num - 1;
    this.prev_link = format(base, num - 1);
  }

  if (num == total){
    this.next = 0;
    this.next_link = '';
  } else {
    this.next = num + 1;
    this.next_link = format(base, num + 1);
  }
};

/**
 * Render pagination contents.
 *
 * @param {String} base
 * @param {Model} posts
 * @param {String} layout
 * @param {Function} render
 * @api private
 */

module.exports = function(base, posts, layout, render){
  if (perPage && posts.length){
    var total = Math.ceil(posts.length / perPage);

    for (var i=1; i<=total; i++){
      (function(i){
        var paginator = new Paginator(base, posts, i, total),
          path = paginator.current_url;

        render(path, [layout, 'archive', 'index'], paginator);
      })(i);
    }
  } else {
    render(base, [layout, 'archive', 'index'], {posts: posts});
  }
};