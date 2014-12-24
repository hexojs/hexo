var util = require('hexo-util');
var escape = util.escape;

var regexCache = {
  home: {},
  post: {}
};

exports.current = function(path, strict){
  if (strict){
    if (path[path.length - 1] === '/') path += 'index.html';

    return this.path === path;
  } else {
    path = path.replace(/\/index\.html$/, '/');

    return this.path.substring(0, path.length) === path;
  }
};

exports.home = function(){
  if (this.path === '') return true;

  var paginationDir = this.config.pagination_dir;
  var r = regexCache.home[paginationDir];

  if (!r){
    r = regexCache.home[paginationDir] = new RegExp('^' + escape.regex(paginationDir) + '\\/\\d+\\/');
  }

  return r.test(this.path);
};

exports.post = function(){
  var permalink = this.config.permalink;
  var r = regexCache.post[permalink];

  if (!r){
    var rUrl = escape.regex(permalink)
      .replace(':id', '\\d+')
      .replace(':category', '(\\w+\\/?)+')
      .replace(':year', '\\d{4}')
      .replace(/:(month|day)/g, '\\d{2}')
      .replace(/:i_(month|day)/g, '\\d{1,2}')
      .replace(/:title/, '[^\\/]+');

    r = regexCache.post[permalink] = new RegExp(rUrl);
  }

  return r.test(this.path);
};

exports.archive = function(){
  return Boolean(this.archive);
};

exports.year = function(year){
  if (!this.archive) return false;

  if (year){
    return this.year === year;
  } else {
    return Boolean(this.year);
  }
};

exports.month = function(year, month){
  if (!this.archive) return false;

  if (year){
    if (month){
      return this.year === year && this.month === month;
    } else {
      return this.month === year;
    }
  } else {
    return Boolean(this.year && this.month);
  }
};

exports.category = function(){
  return Boolean(this.category);
};

exports.tag = function(){
  return Boolean(this.tag);
};