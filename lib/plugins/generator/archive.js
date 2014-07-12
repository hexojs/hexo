var paginator = require('./paginator'),
  _ = require('lodash');

module.exports = function(locals, render, callback){
  var config = hexo.config,
    mode = +config.archive,
    archiveDir = config.archive_dir + '/';

  if (!mode) return callback();

  var generate = function(path, posts, options){
    if (mode === 2){
      paginator(path, posts, 'archive', render, options);
    } else {
      render(path, ['archive', 'index'], _.extend({posts: posts}, options));
    }
  };

  var posts = locals.posts.sort('date', -1);

  if (!posts.length) return callback();

  generate(archiveDir, posts, {archive: true});

  var newest = posts.first().date,
    oldest = posts.last().date;

  // Yearly
  for (var i = oldest.year(); i <= newest.year(); i++){
    var yearly = posts.find({date: {$year: i}});

    if (!yearly.length) continue;

    generate(archiveDir + i + '/', yearly, {
      archive: true,
      year: i
    });

    // Monthly
    for (var j = 1; j <= 12; j++){
      var monthly = yearly.find({date: {$year: i, $month: j}});

      if (!monthly.length) continue;

      generate(archiveDir + i + '/' + (j < 10 ? '0' + j : j) + '/', monthly, {
        archive: true,
        year: i,
        month: j
      });
    }
  }

  callback();
};