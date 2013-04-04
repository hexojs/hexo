var extend = require('../../extend'),
  _ = require('lodash'),
  moment = require('moment'),
  root = hexo.config.root,
  archiveDir = hexo.config.archive_dir;

var result = function(prefix, obj, options){
  var defaults = {
    orderby: 'name',
    order: 1,
    show_count: true
  };

  var options = _.extend(defaults, options);

  var result = '<ul class="' + prefix + '-list">',
    orderby = options.orderby,
    order = options.order,
    showCount = options.show_count;

  if (orderby){
    obj = obj.sort(orderby, order);
  }

  obj.each(function(item){
    if (!item.length) return;

    result += '<li class="' + prefix + '-item">' +
      '<a href="' + root + item.path + '" class="' + prefix + '-link">' + item.name + '</a>' +
      (showCount ? '<span class="' + prefix + '-count">' + item.length + '</span>' : '') +
      '</li>';
  });

  return result + '</ul>';
};

extend.helper.register('list_categories', function(categories, options){
  return result('category', categories, options);
});

extend.helper.register('list_tags', function(tags, options){
  return result('tag', tags, options);

extend.helper.register('list_archives', function(options){
  var defaults = {
    type: 'monthly',
    order: 1,
    show_count: true,
    format: 'MMMM YYYY'
  };

  var options = _.extend(defaults, options);

  var type = options.type,
    order = options.order,
    format = options.format,
    showCount = options.show_count,
    arr = [];

  var posts = this.site.posts.sort('date'),
    newest = posts.last().date,
    oldest = posts.first().date;

  for (var i = oldest.year(); i <= newest.year(); i++){
    var yearly = posts.find({date: {$lt: new Date(i + 1, 0, 1), $gte: new Date(i, 0, 1)}});
    if (!yearly.length) continue;

    if (type === 'yearly'){
      arr.push('<li class="archive-item">' +
        '<a href="' + root + archiveDir + '/' + i + '/" class="archive-link">' + moment([i]).format(format) + '</a>' +
        (showCount ? '<span class="archive-count">' + yearly.length + '</span>' : '') +
        '</li>');
      continue;
    }

    for (var j = 1; j <= 12; j++){
      var monthly = yearly.find({date: {$lt: new Date(i, j, 1), $gte: new Date(i, j - 1, 1)}});
      if (!monthly.length) continue;

      arr.push('<li class="archive-item">' +
        '<a href="' + root + archiveDir + '/' + i + '/' + j + '/" class="archive-link">' + moment([i, j - 1]).format(format) + '</a>' +
        (showCount ? '<span class="archive-count">' + monthly.length + '</span>' : '') +
        '</li>');
    }
  }

  if (order == -1 || order.toString().toLowerCase() === 'desc'){
    arr = arr.reverse();
  }

  return '<ul class="archive-list">' + arr.join('') + '</ul>';
});