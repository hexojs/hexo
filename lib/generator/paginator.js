var async = require('async'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  config = hexo.config,
  root = config.root,
  perPage = config.per_page,
  pageDir = config.pagination_dir;

var Paginator = function(base, posts, num, total){
  var pageLink = base + pageDir + '/';

  this.base = root + base;
  this.per_page = perPage;
  this.total = total;
  this.current = num;
  this.current_url = num === 1 ? base : pageLink + num + '/';
  this.posts = posts.slice(perPage * (num - 1), perPage * num);

  this.archive = posts.archive || false;
  this.year = posts.year || null;
  this.month = posts.month || null;
  this.category = posts.category || '';
  this.tag = posts.tag || '';

  if (num === 1){
    this.prev = 0;
    this.prev_link = '';
  } else if (num === 2){
    this.prev = 1;
    this.prev_link = base;
  } else {
    this.prev = num - 1;
    this.prev_link = pageLink + (num - 1) + '/';
  }

  if (num === total){
    this.next = 0;
    this.next_link = '';
  } else {
    this.next = num + 1;
    this.next_link = pageLink + (num + 1) + '/';
  }
};

module.exports = function(base, posts, layout, render, callback){
  if (perPage && posts.length){
    var total = Math.ceil(posts.length / config.per_page);

    for (var i=1; i<=total; i++){
      (function(i){
        var paginator = new Paginator(base, posts, i, total),
          path = paginator.current_url;

        route.set(path, function(func){
          var result = render(layout, paginator);
          if (!result && layout !== 'archive') result = render('archive', paginator);
          if (!result) result = render('index', paginator);

          func(null, result);
        });
      })(i);
    }
  } else {
    route.set(base, function(func){
      var data = {posts: posts};

      var result = render(layout, data);
      if (!result && layout !== 'archive') result = render('archive', data);
      if (!result) result = render('index', data);

      func(null, result);
    });
  }

  callback();
};