var paginator = require('./paginator'),
  extend = require('../../extend'),
  route = require('../../route'),
  config = hexo.config,
  mode = config.archive,
  archiveDir = config.archive_dir + '/';

extend.generator.register(function(locals, render, callback){
  if (!mode){
    if (mode == 0 || mode === false){
      return callback();
    } else {
      mode = 2;
    }
  }

  var generate = function(path, posts){
    if (mode == 2){
      paginator(path, posts, 'archive', render);
    } else {
      route.set(path, function(fn){
        var result = render('archive', posts);
        if (!result) result = render('index', posts);

        fn(null, result);
      });
    }
  };

  var posts = locals.posts.sort('date', -1);
  if (!posts.length) return callback();
  posts.archive = true;

  generate(archiveDir, posts);

  var newest = posts.first().date,
    oldest = posts.last().date;

  // Yearly
  for (var i=oldest.year(); i<=newest.year(); i++){
    var yearly = posts.find({date: {$lt: new Date(i + 1, 0, 1), $gte: new Date(i, 0, 1)}});
    if (yearly.length){
      yearly.year = i;
      yearly.archive = true;
      generate(archiveDir + i + '/', yearly);

      // Monthly
      for (var j=1; j<=12; j++){
        var monthly = yearly.find({date: {$lt: new Date(i, j, 1), $gte: new Date(i, j - 1, 1)}});
        if (monthly.length){
          monthly.year = i;
          monthly.month = j;
          monthly.archive = true;
          generate(archiveDir + i + '/' + (j < 10 ? '0' + j : j) + '/');
        }
      }
    }
  }

  callback();
});