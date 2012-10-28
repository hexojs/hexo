var paginator = require('./paginator'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  async = require('async'),
  _ = require('underscore');

extend.generator.register(function(locals, render, callback){
  var posts = locals.posts,
    config = hexo.config,
    publicDir = hexo.public_dir;

  if (!config.archive) return callback();

  console.log('Generating archives.');

  async.parallel([
    // All posts
    function(next){
      var target = config.archive_dir + '/';

      posts.archive = true;

      if (config.archive == 2){
        paginator(target, posts, 'archive', render, next);
      } else {
        render('archive', posts, function(err, result){
          if (err) throw err;
          file.write(publicDir + target + 'index.html', result, next);
        });
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
            var target = config.archive_dir + '/' + year + '/';

            yearly[year].year = year;
            yearly[year].archive = true;

            if (config.archive == 2){
              paginator(target, yearly[year], 'archive', render, next);
            } else {
              render('archive', yearly[year], function(err, result){
                if (err) throw err;
                file.write(publicDir + target + 'index.html', result, callback);
              });
            }
          },
          // Monthly
          function(next){
            async.forEach(Object.keys(monthly[year]), function(month, next){
              var target = config.archive_dir + '/' + year + '/' + month + '/';

              monthly[year][month].year = year;
              monthly[year][month].month = month;
              monthly[year][month].archive = true;

              if (config.archive == 2){
                paginator(target, monthly[year][month], 'archive', render, next);
              } else {
                render('archive', monthly[year][month], function(err, result){
                  if (err) throw err;
                  file.write(publicDir + target + 'index.html', result, callback);
                });
              }
            }, next);
          }
        ], next);
      }, next);
    }
  ], callback);
});