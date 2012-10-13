var async = require('async'),
  util = require('../util'),
  file = util.file;

function Paginator(base, posts, num, total){
  var config = hexo.config;

  this.per_page = config.per_page;
  this.total = total;
  this.current = num;
  this.current_url = num === 1 ? base : base + config.pagination_dir + '/' + num + '/';
  this.posts = posts.slice(config.per_page * (num - 1), config.per_page * num);

  if (num === 1){
    this.prev = '';
  } else if (num === 2){
    this.prev = base;
  } else {
    this.prev = base + config.pagination_dir + '/' + (num - 1);
  }

  if (num === total){
    this.next = '';
  } else {
    this.next = base + config.pagination_dir + '/' + (num + 1);
  }
};

module.exports = function(base, posts, layout, render, callback){
  var config = hexo.config,
    publicDir = hexo.public_dir,
    total = Math.ceil(posts.length / config.per_page),
    i = 1;

  async.whilst(
    function(){
      return i <= total;
    },
    function(next){
      var paginator = new Paginator(base, posts, i, total);

      render(layout, paginator, function(err, result){
        if (err) throw err;
        i++;
        file.write(publicDir + paginator.current_url + 'index.html', result, next);
      });
    },
    callback
  );
};