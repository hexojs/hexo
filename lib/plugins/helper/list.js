var extend = require('../../extend'),
  _ = require('lodash'),
  root = hexo.config.root;

var result = function(prefix, obj, options){
  var defaults = {
    orderby: 'name',
    order: 1,
    show_count: true
  };

  options = _.extend(defaults, options);

  var result = '<ul class="' + prefix + '-list">',
    orderby = options.orderby,
    order = options.order,
    showCount = options.show_count;

  if (orderby){
    obj = obj.sort(orderby, order);
  }

  obj.each(function(item){
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
});