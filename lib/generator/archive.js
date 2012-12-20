var paginator = require('./paginator'),
  extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  async = require('async'),
  _ = require('underscore');

extend.generator.register(function(locals, render, callback){
  var posts = _.clone(locals.posts),
    config = hexo.config,
    mode = config.archive,
    archiveDir = config.archive_dir + '/';

  if (!config) return callback();

  async.parallel([
    // All posts
    function(next){
      posts.archive = true;

      if (mode == 2){
        paginator(archiveDir, posts, 'archive', render, next);
      } else {
        route.set(archiveDir, function(func){
          var result = render('archive', posts);
          if (!result) result = render('index', posts);

          func(null, result);
        });

        next();
      }
    },
    // Analyze
    function(next){
      var yearly = {},
        monthly = {};

      posts.each(function(item, i){
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

      async.forEach(Object.keys(yearly), function(year, next){
        async.parallel([
          // Yearly
          function(next){
            var target = archiveDir + year + '/';

            yearly[year].year = year;
            yearly[year].archive = true;

            if (mode == 2){
              paginator(target, yearly[year], 'archive', render, next);
            } else {
              route.set(target, function(func){
                var result = render('archive', yearly[year]);
                if (!result) result = render('index', yearly[year]);

                func(null, result);
              });

              next();
            }
          },
          // Monthly
          function(next){
            async.forEach(Object.keys(monthly[year]), function(month, next){
              var target = archiveDir + year + '/' + month + '/';

              monthly[year][month].year = year;
              monthly[year][month].month = month;
              monthly[year][month].archive = true;

              if (mode == 2){
                paginator(target, monthly[year][month], 'archive', render, next);
              } else {
                route.set(target, function(func){
                  var result = render('archive', monthly[year][month]);
                  if (!result) result = render('index', monthly[year][month]);

                  func(null, result);
                });

                next();
              }
            }, next);
          }
        ], next);
      }, next);
    }
  ], callback);
});