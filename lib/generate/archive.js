var paginator = require('./paginator'),
  extend = require('../extend'),
  async = require('async'),
  _ = require('underscore');

extend.generate.register(function(locals, render, callback){
  var posts = locals.posts,
    config = hexo.config;

  async.parallel([
    // All posts
    function(next){
      paginator(config.archive_dir + '/', posts, 'archive', render, next);
    },
    // Yearly
    function(next){
      var yearly = {},
        monthly = {};

      _.each(posts.toArray(), function(item, i){
        var year = item.date.year(),
          month = item.date.format('MM');

        if (yearly.hasOwnProperty(year)){
          yearly[year].push(item);
        } else {
          yearly[year] = posts.slice(i, i + 1);
        }

        if (!monthly.hasOwnProperty(year)) monthly[year] = {};

        if (monthly[year].hasOwnProperty(month)){
          monthly[year][month].push(item);
        } else {
          monthly[year][month] = posts.slice(i, i + 1);
        }
      });

      async.forEach(Object.keys(yearly), function(ykey, next){
        async.parallel([
          function(next){
            paginator(config.archive_dir + '/' + ykey + '/', yearly[ykey], 'archive', render, next);
          },
          function(next){
            async.forEach(Object.keys(monthly[ykey]), function(mkey, next){
              paginator(config.archive_dir + '/' + ykey + '/' + mkey + '/', monthly[ykey][mkey], 'archive', render, next);
            }, next)
          }
        ], next);
      }, next);
    }
  ], callback);
});