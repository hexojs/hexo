var _ = require('lodash');

module.exports = function(base, posts, layout, render, options){
  options = options || {};

  var config = this.config;
  var perPage = config.per_page;
  var length = posts.length;
  var total = Math.ceil(length / perPage);
  var paginationDir = config.pagination_dir;
  var urlCache = [''];
  var layouts = ['archive', 'index'];

  if (layout){
    layouts.unshift(layout);
  }

  function formatUrl(i){
    if (urlCache[i]) return urlCache[i];

    var result = base;
    if (i > 1) result += paginationDir + '/' + i + '/';
    urlCache[i] = result;

    return result;
  }

  function Paginator(i){
    this.current = i;
    this.current_url = formatUrl(i);
    this.posts = posts.slice(perPage * (i - 1), perPage * i);

    if (i === 1){
      this.prev = 0;
      this.prev_link = '';
    } else {
      this.prev = i - 1;
      this.prev_link = formatUrl(i - 1);
    }

    if (i === total){
      this.next = 0;
      this.next_link = '';
    } else {
      this.next = i + 1;
      this.next_link = formatUrl(i + 1);
    }
  }

  Paginator.prototype.base = config.root + base;
  Paginator.prototype.total = total;

  if (perPage > 0){
    for (var i = 1; i <= total; i++){
      var data = _.extend(new Paginator(i), options);
      render(data.current_url, layouts, data);
    }
  } else {
    options.posts = posts;
    render(base, layouts, options);
  }
};