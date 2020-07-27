'use strict';

const { url_for } = require('hexo-util');

function listTagsHelper(tags, options) {
  if (!options && (!tags || !Object.prototype.hasOwnProperty.call(tags, 'length'))) {
    options = tags;
    tags = this.site.tags;
  }

  if (!tags || !tags.length) return '';
  options = options || {};

  const { style = 'list', transform, separator = ', ', suffix = '' } = options;
  const showCount = Object.prototype.hasOwnProperty.call(options, 'show_count') ? options.show_count : true;
  const classStyle = typeof style === 'string' ? `-${style}` : '';
  let className, ulClass, liClass, aClass, countClass;
  if (typeof options.class !== 'undefined') {
    if (typeof options.class === 'string') {
      className = options.class;
    } else {
      className = 'tag';
    }

    ulClass = options.class.ul || `${className}${classStyle}`;
    liClass = options.class.li || `${className}${classStyle}-item`;
    aClass = options.class.a || `${className}${classStyle}-link`;
    countClass = options.class.count || `${className}${classStyle}-count`;
  } else {
    className = 'tag';
    ulClass = `${className}${classStyle}`;
    liClass = `${className}${classStyle}-item`;
    aClass = `${className}${classStyle}-link`;
    countClass = `${className}${classStyle}-count`;
  }
  const orderby = options.orderby || 'name';
  const order = options.order || 1;
  let result = '';

  // Sort the tags
  tags = tags.sort(orderby, order);

  // Ignore tags with zero posts
  tags = tags.filter(tag => tag.length);

  // Limit the number of tags
  if (options.amount) tags = tags.limit(options.amount);

  if (style === 'list') {
    result += `<ul class="${ulClass}" itemprop="keywords">`;

    tags.forEach(tag => {
      result += `<li class="${liClass}">`;

      result += `<a class="${aClass}" href="${url_for.call(this, tag.path)}${suffix}" rel="tag">`;
      result += transform ? transform(tag.name) : tag.name;
      result += '</a>';

      if (showCount) {
        result += `<span class="${countClass}">${tag.length}</span>`;
      }

      result += '</li>';
    });

    result += '</ul>';
  } else {
    tags.forEach((tag, i) => {
      if (i) result += separator;

      result += `<a class="${aClass}" href="${url_for.call(this, tag.path)}${suffix}" rel="tag">`;
      result += transform ? transform(tag.name) : tag.name;

      if (showCount) {
        result += `<span class="${countClass}">${tag.length}</span>`;
      }

      result += '</a>';
    });
  }

  return result;
}

module.exports = listTagsHelper;
