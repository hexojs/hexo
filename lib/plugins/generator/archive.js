var paginator = require('./paginator');

module.exports = function(locals, render){
  var config = this.config;
  var mode = +config.archive;
  var archiveDir = config.archive_dir + '/';
  var self = this;

  if (!mode) return;

  var allPosts = locals.posts.sort('-date');
  if (!allPosts.length) return;

  function generate(path, posts, options){
    options = options || {};
    options.archive = true;

    if (mode === 2){
      paginator.call(self, path, posts, null, render, options);
    } else {
      options.posts = posts;
      render(path, ['archive', 'index'], options);
    }
  }

  generate(archiveDir, allPosts);

  var posts = {};

  // Organize posts by date
  allPosts.forEach(function(post){
    var date = post.date;
    var year = date.year();
    var month = date.month() + 1; // month is started from 0

    if (!posts.hasOwnProperty(year)){
      // 13 arrays. The first array is for posts in this year
      // and the other arrays is for posts in this month
      posts[year] = [
        [], [], [], [], [], [], [], [], [], [], [], [], []
      ];
    }

    posts[year][0].push(post);
    posts[year][month].push(post);
  });

  // TODO: Add "createQuery" API in warehouse
  var Query = this.model('Post').Query;
  var years = Object.keys(posts);
  var year, data, month, monthData, url;

  // Yearly
  for (var i = 0, len = years.length; i < len; i++){
    year = +years[i];
    data = posts[year];
    url = archiveDir + year + '/';
    if (!data[0].length) continue;

    generate(url, new Query(data[0]), {year: year});

    // Monthly
    for (month = 1; month <= 12; month++){
      monthData = data[month];
      if (!monthData.length) continue;

      generate(url + (month < 10 ? '0' + month : month) + '/', new Query(monthData), {
        year: year,
        month: month
      });
    }
  }
};