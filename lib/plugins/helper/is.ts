function isCurrentHelper(path = '/', strict: boolean) {
  const currentPath = this.path.replace(/^[^/].*/, '/$&');

  if (strict) {
    if (path.endsWith('/')) path += 'index.html';
    path = path.replace(/^[^/].*/, '/$&');

    return currentPath === path;
  }

  path = path.replace(/\/index\.html$/, '/');

  if (path === '/') return currentPath === '/index.html';

  path = path.replace(/^[^/].*/, '/$&');

  return currentPath.startsWith(path);
}

function isHomeHelper() {
  return Boolean(this.page.__index);
}

function isHomeFirstPageHelper() {
  return Boolean(this.page.__index) && this.page.current === 1;
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
  const { page } = this;
  if (!page.archive) return false;

  if (year) {
    return page.year === year;
  }

  return Boolean(page.year);
}

function isMonthHelper(year, month) {
  const { page } = this;
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

export {isCurrentHelper as current};
export {isHomeHelper as home};
export {isHomeFirstPageHelper as home_first_page};
export {isPostHelper as post};
export {isPageHelper as page};
export {isArchiveHelper as archive};
export {isYearHelper as year};
export {isMonthHelper as month};
export {isCategoryHelper as category};
export {isTagHelper as tag};
