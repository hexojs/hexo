var _ = require('lodash');

var format = function(base, i){
  return base + (i == 1 ? '' : hexo.config.pagination_dir + '/' + i + '/');
};

var Paginator = function(base, posts, num, total){
  var config = hexo.config,
    perPage = this.per_page = config.per_page;

  this.base = config.root + base;
  this.total = total;
  this.current = num;
  this.current_url = format(base, num);
  this.posts = posts.slice(perPage * (num - 1), perPage * num);

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

module.exports = function(base, posts, layout, render, options){
  var config = hexo.config;

  if (config.per_page && posts.length){
    var total = Math.ceil(posts.length / config.per_page);

    var renderData = function(i){
      var data = _.extend(new Paginator(base, posts, i, total), options);

      render(data.current_url, [layout, 'archive', 'index'], data);
    };

    for (var i = 1; i <= total; i++){
      renderData(i);
    }
  } else {
    render(base, [layout, 'archive', 'index'], _.extend({posts: posts}, options));
  }
};