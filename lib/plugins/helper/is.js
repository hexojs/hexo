'use strict';

function isCurrentHelper(path, strict){
  /* jshint validthis: true */
  path = path || '';

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
  return Boolean(this.page.__index);
}

function isPostHelper(){
  /* jshint validthis: true */
  return Boolean(this.page.__post);
}

function isPageHelper(){
  /* jshint validthis: true */
  return Boolean(this.page.__page);
}

function isArchiveHelper(){
  /* jshint validthis: true */
  return Boolean(this.page.archive);
}

function isYearHelper(year){
  /* jshint validthis: true */
  var page = this.page;
  if (!page.archive) return false;

  if (year){
    return page.year === year;
  } else {
    return Boolean(page.year);
  }
}

function isMonthHelper(year, month){
  /* jshint validthis: true */
  var page = this.page;
  if (!page.archive) return false;

  if (year){
    if (month){
      return page.year === year && page.month === month;
    } else {
      return page.month === year;
    }
  } else {
    return Boolean(page.year && page.month);
  }
}

function isCategoryHelper(){
  /* jshint validthis: true */
  return Boolean(this.page.category);
}

function isTagHelper(){
  /* jshint validthis: true */
  return Boolean(this.page.tag);
}

exports.current = isCurrentHelper;
exports.home = isHomeHelper;
exports.post = isPostHelper;
exports.page = isPageHelper;
exports.archive = isArchiveHelper;
exports.year = isYearHelper;
exports.month = isMonthHelper;
exports.category = isCategoryHelper;
exports.tag = isTagHelper;
