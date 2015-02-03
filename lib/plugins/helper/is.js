'use strict';

var util = require('hexo-util');
var escapeRegExp = util.escapeRegExp;

var regexCache = {
  home: {},
  post: {}
};

function isCurrentHelper(path, strict){
  /* jshint validthis: true */
  if (strict){
    if (path[path.length - 1] === '/') path += 'index.html';

    return this.path === path;
  } else {
    path = path.replace(/\/index\.html$/, '/');

    return this.path.substring(0, path.length) === path;
  }
}

function isHomeHelper(){
  /* jshint validthis: true */
  var path = this.page.canonical_path || this.path;

  if (!path || path === 'index.html') return true;

  var paginationDir = this.config.pagination_dir;
  var r = regexCache.home[paginationDir];

  if (!r){
    r = regexCache.home[paginationDir] = new RegExp('^' + escapeRegExp(paginationDir) + '\\/\\d+\\/(index\.html)?$');
  }

  return r.test(path);
}

function isPostHelper(){
  /* jshint validthis: true */
  var permalink = this.config.permalink;
  var r = regexCache.post[permalink];

  if (!r){
    var rUrl = escapeRegExp(permalink)
      .replace(':id', '\\d+')
      .replace(':category', '(\\w+\\/?)+')
      .replace(':year', '\\d{4}')
      .replace(/:(month|day)/g, '\\d{2}')
      .replace(/:i_(month|day)/g, '\\d{1,2}')
      .replace(/:title/, '[^\\/]+');

    r = regexCache.post[permalink] = new RegExp(rUrl);
  }

  return r.test(this.path);
}

function isArchiveHelper(){
  /* jshint validthis: true */
  return Boolean(this.archive);
}

function isYearHelper(year){
  /* jshint validthis: true */
  if (!this.archive) return false;

  if (year){
    return this.year === year;
  } else {
    return Boolean(this.year);
  }
}

function isMonthHelper(year, month){
  /* jshint validthis: true */
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
}

function isCategoryHelper(){
  /* jshint validthis: true */
  return Boolean(this.category);
}

function isTagHelper(){
  /* jshint validthis: true */
  return Boolean(this.tag);
}

exports.current = isCurrentHelper;
exports.home = isHomeHelper;
exports.post = isPostHelper;
exports.archive = isArchiveHelper;
exports.year = isYearHelper;
exports.month = isMonthHelper;
exports.category = isCategoryHelper;
exports.tag = isTagHelper;