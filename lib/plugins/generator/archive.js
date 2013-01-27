var paginator = require('./paginator'),
  extend = require('../../extend'),
  route = require('../../route'),
  _ = require('underscore'),
  config = hexo.config,
  mode = config.archive,
  archiveDir = config.archive_dir + '/';

extend.generator.register(function(locals, render, callback){
  if (!mode) return callback();

  var posts = locals.posts.sort('date', -1),
    arr = posts.toArray(),
    latest = true;

  if (!arr.length) return callback();

  for (var i=0, len=arr.length; i<len; i++){
    if (!arr[i]._latest){
      latest = false;
      break;
    }
  }

  if (latest && !hexo.cache.rebuild) return callback();

  // All posts
  posts.archive = true;

  if (mode == 2){
    paginator(archiveDir, posts, 'archive', render);
  } else {
    route.set(archiveDir, function(fn){
      var result = render('archive', posts);
      if (!result) result = render('index', posts);

      fn(null, result);
    });
  }

  var newest = posts.first().date,
    oldest = posts.last().date;

  // Yearly
  for (var i=newest.year(); i>=oldest.year(); i--){
    (function(year){
      var query = {$lt: new Date((year + 1).toString()), $gte: new Date(year.toString())},
        yearly = locals.posts.find({date: query}).sort('date', -1),
        arr = yearly.toArray(),
        latest = true;

      for (var i=0, len=arr.length; i<len; i++){
        if (arr[i]._latest){
          latest = false;
          break;
        }
      }

      if (!latest || hexo.cache.rebuild){
        var target = archiveDir + year + '/';

        yearly.year = year;
        yearly.archive = true;

        if (mode == 2){
          paginator(target, yearly, 'archive', render);
        } else {
          route.set(target, function(fn){
            var result = render('archive', yearly);
            if (!result) result = render('archive', yearly);

            fn(null, result);
          });
        }

        // Monthly
        for (var j=1; j<=12; j++){
          (function(month){
            var query = {$lt: new Date(year.toString(), month), $gte: new Date(year.toString(), month - 1)},
              monthly = locals.posts.find({date: query}).sort('date', -1),
              arr = monthly.toArray(),
              latest = true;

            for (var i=0, len=arr.length; i<len; i++){
              if (!arr[i]._latest){
                latest = false;
                break;
              }
            }

            if (!latest || hexo.cache.rebuild){
              var target = archiveDir + year + '/' + (month < 10 ? '0' + month : month) + '/';

              if (monthly.count() > 0){
                monthly.year = year;
                monthly.month = month;
                monthly.archive = true;

                if (mode == 2){
                  paginator(target, monthly, 'archive', render);
                } else {
                  route.set(target, function(fn){
                    var result = render('archive', monthly);
                    if (!result) result = render('archive', monthly);

                    fn(null, result);
                  });
                }
              }
            }
          })(j);
        }
      }
    })(i);
  }

  callback();
});