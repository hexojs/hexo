'use strict';

function isCurrentHelper(path, strict) {
  path = path || '/';
  var currentPath = this.path.replace(/^[^\/].*/, function(_) { // eslint-disable-line no-useless-escape
    return '/' + _;
  });

  if (strict) {
    if (path[path.length - 1] === '/') path += 'index.html';
    path = path.replace(/^[^\/].*/, function(_) { // eslint-disable-line no-useless-escape
      return '/' + _;
    });

    return currentPath === path;
  }

  path = path.replace(/\/index\.html$/, '/');

  if (path === '/') return currentPath === '/index.html';

  path = path.replace(/^[^\/].*/, function(_) { // eslint-disable-line no-useless-escape
    return '/' + _;
  });

  return currentPath.substring(0, path.length) === path;
}

function isHomeHelper() {
  return Boolean(this.page.__index);
}

function isPostHelper() {
  return Boolean(this.page.__post);
}

function isPageHelper() {
  return Boolean(this.page.__page);
}

function isArchiveHelper() {
  return Boolean(this.page.archive);
}

function isYearHelper(year) {
  var page = this.page;
  if (!page.archive) return false;

  if (year) {
    return page.year === year;
  }

  return Boolean(page.year);
}

function isMonthHelper(year, month) {
  var page = this.page;
  if (!page.archive) return false;

  if (year) {
    if (month) {
      return page.year === year && page.month === month;
    }

    return page.month === year;
  }

  return Boolean(page.year && page.month);
}

function isCategoryHelper(category) {
  if (category) {
    return this.page.category === category;
  }

  return Boolean(this.page.category);
}

function isTagHelper(tag) {
  if (tag) {
    return this.page.tag === tag;
  }

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
