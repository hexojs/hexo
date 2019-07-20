'use strict';

function listCategoriesHelper(categories, options) {
  if (!options && (!categories || !Object.prototype.hasOwnProperty.call(categories, 'length'))) {
    options = categories;
    categories = this.site.categories;
  }

  if (!categories || !categories.length) return '';
  options = options || {};

  const { style = 'list', transform, separator = ', ', suffix = '' } = options;
  const showCount = Object.prototype.hasOwnProperty.call(options, 'show_count') ? options.show_count : true;
  const className = options.class || 'category';
  const depth = options.depth ? parseInt(options.depth, 10) : 0;
  const orderby = options.orderby || 'name';
  const order = options.order || 1;
  const showCurrent = options.show_current || false;
  const childrenIndicator = Object.prototype.hasOwnProperty.call(options, 'children_indicator') ? options.children_indicator : false;

  const prepareQuery = parent => {
    const query = {};

    if (parent) {
      query.parent = parent;
    } else {
      query.parent = {$exists: false};
    }

    return categories.find(query).sort(orderby, order).filter(cat => cat.length);
  };

  const hierarchicalList = (level, parent) => {
    let result = '';

    prepareQuery(parent).forEach((cat, i) => {
      let child;
      if (!depth || level + 1 < depth) {
        child = hierarchicalList(level + 1, cat._id);
      }

      let isCurrent = false;
      if (showCurrent && this.page) {
        for (let j = 0; j < cat.length; j++) {
          const post = cat.posts.data[j];
          if (post && post._id === this.page._id) {
            isCurrent = true;
            break;
          }
        }

        // special case: category page
        isCurrent = isCurrent || (this.page.base && this.page.base.startsWith(cat.path));
      }

      const additionalClassName = child && childrenIndicator ? ` ${childrenIndicator}` : '';

      result += `<li class="${className}-list-item${additionalClassName}">`;

      result += `<a class="${className}-list-link${isCurrent ? ' current' : ''}" href="${this.url_for(cat.path)}${suffix}">`;
      result += transform ? transform(cat.name) : cat.name;
      result += '</a>';

      if (showCount) {
        result += `<span class="${className}-list-count">${cat.length}</span>`;
      }

      if (child) {
        result += `<ul class="${className}-list-child">${child}</ul>`;
      }

      result += '</li>';
    });

    return result;
  };

  const flatList = (level, parent) => {
    let result = '';

    prepareQuery(parent).forEach((cat, i) => {
      if (i || level) result += separator;

      result += `<a class="${className}-link" href="${this.url_for(cat.path)}${suffix}">`;
      result += transform ? transform(cat.name) : cat.name;

      if (showCount) {
        result += `<span class="${className}-count">${cat.length}</span>`;
      }

      result += '</a>';

      if (!depth || level + 1 < depth) {
        result += flatList(level + 1, cat._id);
      }
    });

    return result;
  };

  if (style === 'list') {
    return `<ul class="${className}-list">${hierarchicalList(0)}</ul>`;
  }

  return flatList(0);
}

module.exports = listCategoriesHelper;
