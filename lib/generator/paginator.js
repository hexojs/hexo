var async = require('async'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  config = hexo.config,
  perPage = config.per_page,
  pageDir = config.pagination_dir;

var Paginator = function(base, posts, num, total){
  var pageLink = this.base = base + pageDir + '/';

  this.per_page = perPage;
  this.total = total;
  this.current = num;
  this.current_url = this.path = num === 1 ? base : pageLink + num + '/';
  this.permalink = config.url + '/' + this.path;
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

var range = function(min, max){
  var length = max - min + 1,
    arr = new Array(length);

  for (var i=0; i<length; i++){
    arr[i] = min + i;
  }

  return arr;
};

module.exports = function(base, posts, layout, render, callback){
  if (perPage && posts.length){
    var total = Math.ceil(posts.length / config.per_page);

    async.forEach(range(1, total), function(i, next){
      var paginator = new Paginator(base, posts, i, total);

      route.set(paginator.current_url, function(func){
        var result = render(layout, paginator);
        if (!result && layout !== 'archive') result = render('archive', paginator);
        if (!result) result = render('index', paginator);

        func(null, result);
      });

      next();
    }, callback);
  } else {
    route.set(base, function(func){
      var result = render(layout, {posts: posts});
      if (!result && layout !== 'archive') result = render('archive', {posts: posts});
      if (!result) result = render('index', {posts: posts});

      func(null, result);
    });

    callback();
  }
};