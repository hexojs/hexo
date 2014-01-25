var _ = require('lodash'),
  moment = require('moment');

exports.list_categories = function(categories, options){
  if (!options){
    options = categories;
    categories = this.site.categories;
  }

  if (!categories.length) return '';

  var options = _.extend({
    orderby: 'name',
    order: 1,
    show_count: true,
    style: 'list',
    separator: ', ',
    depth: 0,
    class: 'category'
  }, options);

  var style = options.style,
    showCount = options.show_count,
    className = options.class,
    depth = options.depth,
    orderby = options.orderby,
    order = options.order,
    root = this.config.root;

  if (style === 'list'){
    var result = '<ul class="' + className + '-list">';
  } else {
    var result = '';
  }

  var arr = [];

  var list = function(i, parent){
    var html = '';

    if (depth == -1){
      var condition = {};
    } else {
      var condition = {
        parent: parent ? parent : {$exist: false}
      };
    }

    categories.find(condition).sort(orderby, order).each(function(cat){
      if (!cat.length) return;

      if (style === 'list'){
        html += '<li class="' + className + '-list-item">' +
          '<a class="' + className + '-list-link" href="' + root + cat.path + '">' + cat.name + '</a>' +
          (showCount ? '<span class="' + className + '-list-count">' + cat.length + '</span>' : '');

        if (depth == 0 || depth > i + 1){
          var child = list(i + 1, cat._id);

          if (child){
            html += '<ul class="' + className + '-list-child">' + child + '</ul>';
          }
        }

        html += '</li>';

        if (i == 0 && depth > -1) arr.push(html);
      } else {
        arr.push('<a class="' + className + '-link" href="' + root + cat.path + '">' +
          cat.name +
          (showCount ? '<span class="' + className + '-count">' + cat.length + '</span>' : '') +
          '</a>');

        if (depth == 0 || depth > i + 1){
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

  var options = _.extend({
    orderby: 'name',
    order: 1,
    show_count: true,
    style: 'list',
    separator: ', ',
    class: 'tag'
  }, options);

  var style = options.style,
    showCount = options.show_count,
    className = options.class,
    root = this.config.root;

  if (style === 'list'){
    var result = '<ul class="' + className + '-list">';
  } else {
    var result = '';
  }

  var arr = [];

  tags.sort(options.orderby, options.order).each(function(tag){
    if (!tag.length) return;

    if (style === 'list'){
      arr.push('<li class="' + className + '-list-item">' +
        '<a class="' + className + '-list-link" href="' + root + tag.path + '">' + tag.name + '</a>' +
        (showCount ? '<span class="' + className + '-list-count">' + tag.length + '</span>' : '') +
        '</li>');
    } else {
      arr.push('<a class="' + className + '-link" href="' + root + tag.path + '">' +
        tag.name +
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
  var options = _.extend({
    type: 'monthly',
    order: -1,
    show_count: true,
    style: 'list',
    separator: ', ',
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
    root = this.config.root,
    archiveDir = this.config.archive_dir;

  if (style === 'list'){
    var result = '<ul class="' + className + '-list">';
  } else {
    var result = '';
  }

  var posts = this.site.posts.sort('date', -1),
    arr = [];

  if (!posts.length) return '';

  var item = function(href, name, length){
    if (style === 'list'){
      arr.push('<li class="' + className + '-list-item">' +
        '<a class="' + className + '-list-link" href="' + root + archiveDir + '/' + href + '">' + name + '</a>' +
        (showCount ? '<span class="' + className + '-list-count">' + length + '</span>' : '') +
        '</li>')
    } else {
      arr.push('<a class="' + className + '-link" href="' + root + archiveDir + '/' + href + '">' +
        name +
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

      item(i + '/' + (j < 10 ? '0' + j : j), moment({year: i, month: j - 1}).format(format), monthly.length);
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

function get_posts(site,options){
  if (!options) {
    options = {};
  }

  options = _.extend({
    count: 6,
    orderby: 'date',
    order: -1,
    tags: '',
    categories: '',
  }, options);

  var posts = site.posts,tags,categories;
  var query_data = [];

  var findData = function(data,source){
    var len = source.length;
    if (len == 0) return true;
    for (var i = 0; i < len; ++i){
      if (data.indexOf(source[i]) != -1) return true;
    }
    return false;
  }


  var findtag = function(data){return findData(data,tags);}
  var findcategories = function(data){return findData(data,categories);}

  var array_case_find = function(data,value){
    value = value.toUpperCase();
    for(var i=0,len=data.length;i<len;++i){
      if (data[i].toUpperCase() == value) return true;
    }
    return false;
  }

  if (_.isObject(options.tags['_index'])){
    tags = options.tags._index;
  } else {
    if (!_.isObject(options.tags)) options.tags = options.tags.split(/\s*,\s*/);
    if (options.tags && options.tags.length){
      var data = site.tags.find({name: {$where: function(name){return array_case_find(options.tags,name)}}});
      tags = data._index;
    }
  }

  if (_.isObject(options.categories['_index'])){
    categories = options.categories._index;
  } else {
    if (!_.isObject(options.categories)) options.categories = options.categories.split(/\s*,\s*/);
    if (options.categories.length){
      var data = site.categories.find({name: {$where: function(name){return array_case_find(options.categories,name)}}});
      categories = data._index;
    }
  }

  if (tags && tags.length){query_data.push({type: 'tags',func: findtag});}
  if (categories && categories.length){query_data.push({type: 'categories',func: findcategories})}

  if (query_data.length){
    var query = {};
    query_data.forEach(function(data){
      query[data.type] = {$where: data.func};
    })
    posts = posts.find(query);
  }

  if (options.orderby == 'random')
    return posts.random().limit(options.count);
  return posts.sort(options.orderby, options.order).limit(options.count);
};

exports.get_posts = function (options){
  return get_posts(this.site,options);
};

exports.list_posts = function (options) {
  if (!options) {
    options = {};
  }

  options = _.extend({
    ulClass: '',
    liClass: '',
    style: 'list',
    separator: ', ',
    class: 'post',
  }, options);

  var posts = get_posts(this.site,options),
    style = options.style,
    root = this.config.root,
    ul = '<ul class="' + (options.ulClass?options.ulClass:options.class) + '">',
    li = '<li class="' + (options.liClass?options.liClass:options.class + '-list-item') + '">',
    arr = [];

  posts.each(function(post){
    arr.push( '<a href="' + root + post.path + '">' + (post.title?post.title:post.slug) + '</a>');
  });

  if (arr.lentgh == 0) return '';

  if (style != 'list') return arr.join(options.separator);

  return  ul + li + arr.join('</li>' + li) + '</li></ul>';
};