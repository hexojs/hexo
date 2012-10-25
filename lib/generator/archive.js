var paginator = require('./paginator'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  async = require('async'),
  _ = require('underscore');

extend.generate.register(function(locals, render, callback){
  var posts = locals.posts,
    config = hexo.config,
    publicDir = hexo.public_dir;

  if (!config.archive) return callback();

  async.parallel([
    // All posts
    function(next){
      var target = config.archive_dir + '/';

      posts.archive = true;

      if (config.archive === 2){
        paginator(target, posts, 'archive', render, next);
      } else {
        render('archive', posts, function(err, result){
          if (err) throw err;
          file.write(publicDir + target + 'index.html', result, next);
        });
      }
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
            var target = config.archive_dir + '/' + ykey + '/';

            yearly[ykey].year = ykey;
            yearly[ykey].archive = true;

            if (config.archive === 2){
              paginator(target, yearly[ykey], 'archive', render, next);
            } else {
              render('archive', yearly[ykey], function(err, result){
                if (err) throw err;
                file.write(publicDir + target + 'index.html', result, callback);
              });
            }
          },
          function(next){
            async.forEach(Object.keys(monthly[ykey]), function(mkey, next){
              var target = config.archive_dir + '/' + ykey + '/' + mkey + '/';

              monthly[ykey][mkey].year = ykey;
              monthly[ykey][mkey].month = mkey;
              monthly[ykey][mkey].archive = true;

              if (config.archive === 2){
                paginator(target, monthly[ykey][mkey], 'archive', render, next);
              } else {
                render('archive', yearly[ykey], function(err, result){
                  if (err) throw err;
                  file.write(publicDir + target + 'index.html', result, callback);
                });
              }
            }, next);
          }
        ], next);
      }, next);
    }
  ], function(){
    console.log('Archives generated.');
    callback();
  });
});