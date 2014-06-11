var _ = require('lodash');

var findData = function(data, source){
  if (!source.length) return true;

  for (var i = 0, len = source.length; i < len; ++i){
    if (data.indexOf(source[i]) != -1) return true;
  }

  return false;
};

var arrayCaseFind = function(data, value){
  value = value.toUpperCase();

  for (var i = 0,len = data.length; i < len; i++){
    if (data[i].toUpperCase() === value) return true;
  }

  return false;
};

var makeWhereQuery = function(index){
  return function(data){
    return findData(data, index);
  };
};

var getPosts = function(site, options){
  options = _.extend({
    count: 6,
    orderby: 'date',
    order: -1,
    query: {
      tags: '',
      categories: '',
      operator: ''
    }
  }, options);

  var posts = site.posts,
    queryData = [],
    conditions = options.query,
    queryOperator = 'and',
    query = {};

  var getIndex = function(type, query){
    if (_.isObject(query._index)) return query._index;
    if (!_.isObject(query)) query = query.split(/\s*,\s*/);

    if (query && query.length){
      var data = site[type].find({
        name: {
          $where: function(name){
            return arrayCaseFind(query, name);
          }
        }
      });

      return data._index;
    }

    return false;
  };

  var keys = Object.keys(conditions);

  for (var i = 0, len = keys.length; i<len; ++i){
    var key = keys[i],
      obj = {};

    query = conditions[key];

    switch (key){
      case 'tags':
      case 'categories':
        var _index = getIndex(key, query);
        if (_index && _index.length){
          obj[key] = {
            $where: makeWhereQuery(_index)
          };
          queryData.push(obj);
        }
        break;

      case 'operator':
        queryOperator = query;
        break;

      default:
        obj[key] = typeof query === 'function' ? {$where: query} : query;
        queryData.push(obj);
    }
  }

  if (options.posts) posts = options.posts;

  if (options.orderby){
    if (options.orderby == 'random') posts = posts.random();
    else posts = posts.sort(options.orderby, options.order);
  }

  if (queryData.length){
    var queryOpt;
    query = {};

    if (options.count) queryOpt = {limit: options.count};

    query['$' + queryOperator] = queryData;

    return posts.find(query, queryOpt);
  }

  return options.count ? posts.limit(options.count) : posts;
};

exports.get_posts = function(options){
  return getPosts(this.site, options);
};

exports.list_posts = function(options) {
  options = _.extend({
    ulClass: '',
    liClass: '',
    style: 'list',
    separator: ', ',
    class: 'post'
  }, options);

  var posts = getPosts(this.site, options),
    style = options.style,
    ul = '<ul class="' + (options.ulClass ? options.ulClass : options.class) + '">',
    li = '<li class="' + (options.liClass ? options.liClass : options.class + '-list-item') + '">',
    arr = [],
    self = this;

  posts.each(function(post){
    arr.push( '<a href="' + self.url_for(post.path) + '">' + (post.title ? post.title : post.slug) + '</a>');
  });

  if (!arr.length) return '';

  if (style !== 'list') return arr.join(options.separator);

  return ul + li + arr.join('</li>' + li) + '</li></ul>';
};