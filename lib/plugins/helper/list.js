var _ = require('lodash'),
  moment = require('moment'),

  // default: do not transform the value
  transform_default = function(value) { return value; };

exports.list_categories = function(categories, options){
  if (!options){
    options = categories;
    categories = this.site.categories;
  }

  if (!categories.length) return '';

  options = _.extend({
    orderby: 'name',
    order: 1,
    show_count: true,
    style: 'list',
    separator: ', ',
    transform: transform_default,
    depth: 0,
    class: 'category'
  }, options);

  var style = options.style,
    showCount = options.show_count,
    className = options.class,
    depth = parseInt(options.depth, 10),
    orderby = options.orderby,
    order = options.order,
    result = '',
    arr = [],
    condition = {},
    self = this;

  if (style === 'list'){
    result = '<ul class="' + className + '-list">';
  } else {
    result = '';
  }

  var list = function(i, parent){
    var html = '';

    if (depth > -1){
      condition = {
        parent: parent ? parent : {$exist: false}
      };
    }

    categories.find(condition).sort(orderby, order).each(function(cat){
      if (!cat.length) return;

      if (style === 'list'){
        html += '<li class="' + className + '-list-item">' +
          '<a class="' + className + '-list-link" href="' + self.url_for(cat.path) + '">' + options.transform(cat.name) + '</a>' +
          (showCount ? '<span class="' + className + '-list-count">' + cat.length + '</span>' : '');

        if (depth === 0 || depth > i + 1){
          var child = list(i + 1, cat._id);

          if (child){
            html += '<ul class="' + className + '-list-child">' + child + '</ul>';
          }
        }

        html += '</li>';

        if (i === 0 && depth > -1) {
          arr.push(html);
          html = '';
        }
      } else {
        arr.push('<a class="' + className + '-link" href="' + self.url_for(cat.path) + '">' +
          options.transform(cat.name) +
          (showCount ? '<span class="' + className + '-count">' + cat.length + '</span>' : '') +
          '</a>');

        if (depth === 0 || depth > i + 1){
          list(i + 1, cat._id);
        }
      }
    });

    if (style === 'list'){
      if (i > 0){
        return html;
      } else if (depth == -1){
        arr.push(html);
      }
    }
  };

  list(0);

  if (style === 'list'){
    result += arr.join('') + '</ul>';
  } else {
    result += arr.join(options.separator);
  }

  return result;
};

exports.list_tags = function(tags, options){
  if (!options){
    options = tags;
    tags = this.site.tags;
  }

  if (!tags.length) return '';

  options = _.extend({
    limit: 0, // 0 = unlimited
    orderby: 'name',
    order: 1,
    show_count: true,
    style: 'list',
    separator: ', ',
    transform: transform_default,
    class: 'tag'
  }, options);

  var style = options.style,
    showCount = options.show_count,
    className = options.class,
    result = '',
    arr = [],
    self = this;

  if (style === 'list'){
    result = '<ul class="' + className + '-list">';
  } else {
    result = '';
  }

  tags = tags.sort(options.orderby, options.order);

  if (options.amount) tags = tags.limit(options.amount);

  tags.each(function(tag){
    if (!tag.length) return;

    if (style === 'list'){
      arr.push('<li class="' + className + '-list-item">' +
        '<a class="' + className + '-list-link" href="' + self.url_for(tag.path) + '">' + options.transform(tag.name) + '</a>' +
        (showCount ? '<span class="' + className + '-list-count">' + tag.length + '</span>' : '') +
        '</li>');
    } else {
      arr.push('<a class="' + className + '-link" href="' + self.url_for(tag.path) + '">' +
        options.transform(tag.name) +
        (showCount ? '<span class="' + className + '-count">' + tag.length + '</span>' : '') +
        '</a>');
    }
  });

  if (style === 'list'){
    result += arr.join('') + '</ul>';
  } else {
    result += arr.join(options.separator);
  }

  return result;
};

exports.list_archives = function(options){
  options = _.extend({
    type: 'monthly',
    order: -1,
    show_count: true,
    style: 'list',
    separator: ', ',
    transform: transform_default,
    class: 'archive'
  }, options);

  if (!options.format){
    if (options.type === 'monthly'){
      options.format = 'MMMM YYYY';
    } else {
      options.format = 'YYYY';
    }
  }

  var style = options.style,
    showCount = options.show_count,
    className = options.class,
    type = options.type,
    format = options.format,
    archiveDir = this.config.archive_dir,
    result = '',
    arr = [],
    self = this;

  if (style === 'list'){
    result = '<ul class="' + className + '-list">';
  } else {
    result = '';
  }

  var posts = this.site.posts.sort('date', -1);

  if (!posts.length) return '';

  var item = function(href, name, length){
    if (style === 'list'){
      arr.push('<li class="' + className + '-list-item">' +
        '<a class="' + className + '-list-link" href="' + self.url_for(archiveDir + '/' + href) + '">' + options.transform(name) + '</a>' +
        (showCount ? '<span class="' + className + '-list-count">' + length + '</span>' : '') +
        '</li>');
    } else {
      arr.push('<a class="' + className + '-link" href="' + self.url_for(archiveDir + '/' + href) + '">' +
        options.transform(name) +
        (showCount ? '<span class="' + className + '-count">' + length + '</span>' : '') +
        '</a>');
    }
  };

  var newest = posts.first().date,
    oldest = posts.last().date;

  for (var i = oldest.year(); i <= newest.year(); i++){
    var yearly = posts.find({date: {$year: i}});

    if (!yearly.length) continue;

    if (type === 'yearly'){
      item(i, moment({y: i}).format(format), yearly.length);

      continue;
    }

    for (var j = 1; j <= 12; j++){
      var monthly = yearly.find({date: {$year: i, $month: j}});

      if (!monthly.length) continue;

      item(i + '/' + (j < 10 ? '0' + j : j) + '/', moment({year: i, month: j - 1}).format(format), monthly.length);
    }
  }

  if (options.order == -1 || options.order === 'desc') arr.reverse();

  if (style === 'list'){
    result += arr.join('') + '</ul>';
  } else {
    result += arr.join(options.separator);
  }

  return result;
};
