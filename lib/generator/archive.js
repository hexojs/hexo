var paginator = require('./paginator'),
  extend = require('../extend'),
  route = require('../route'),
  _ = require('underscore');

extend.generator.register(function(locals, render, callback){
  var posts = locals.posts,
    config = hexo.config,
    mode = config.archive,
    archiveDir = config.archive_dir + '/';

  if (!config) return callback();

  // All posts
  posts.archive = true;
  if (mode == 2){
    paginator(archiveDir, posts, 'archive', render);
  } else {
    route.set(archiveDir, function(func){
      var result = render('archive', posts);
      if (!result) result = render('index', posts);

      func(null, result);
    });
  }

  // Analyze
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

  // Yearly
  Object.keys(yearly).forEach(function(year){
    var target = archiveDir + year + '/';

    yearly[year].year = year;
    yearly[year].archive = true;

    if (mode == 2){
      paginator(target, yearly[year], 'archive', render);
    } else {
      route.set(target, function(func){
        var result = render('archive', yearly[year]);
        if (!result) result = render('index', yearly[year]);

        func(null, result);
      });
    }

    // Monthly
    Object.keys(monthly[year]).forEach(function(month){
      var target = archiveDir + year + '/' + month + '/';

      monthly[year][month].year = year;
      monthly[year][month].month = month;
      monthly[year][month].archive = true;

      if (mode == 2){
        paginator(target, monthly[year][month], 'archive', render);
      } else {
        route.set(target, function(func){
          var result = render('archive', monthly[year][month]);
          if (!result) result = render('index', monthly[year][month]);

          func(null, result);
        });
      }
    });
  });

  callback();
});