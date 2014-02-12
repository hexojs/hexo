var paginator = require('./paginator'),
  _ = require('lodash');

module.exports = function(locals, render, callback){
  var config = hexo.config;

  if (config.exclude_generator && config.exclude_generator.indexOf('archive') > -1) return callback();

  var mode = config.archive,
    archiveDir = config.archive_dir + '/';

  if (!mode){
    if (mode == 0 || mode === false){
      return callback();
    } else {
      mode = 2;
    }
  }

  var generate = function(path, posts, options){
    if (mode == 2){
      paginator(path, posts, 'archive', render, options);
    } else {
      render(path, ['archive', 'index'], _.extend({posts: posts}, options));
    }
  };

  var sort_by = (config.sort_by == 'date') ? 'date' : 'updated';
  var posts = locals.posts.sort(sort_by, -1);

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
