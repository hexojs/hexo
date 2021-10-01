'use strict';

const { url_for, escapeHTML } = require('hexo-util');
const { default: moize } = require('moize');

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
  let className, ulClass, liClass, aClass, labelClass, countClass, labelSpan;
  if (typeof options.class !== 'undefined') {
    if (typeof options.class === 'string') {
      className = options.class;
    } else {
      className = 'tag';
    }

    ulClass = options.class.ul || `${className}${classStyle}`;
    liClass = options.class.li || `${className}${classStyle}-item`;
    aClass = options.class.a || `${className}${classStyle}-link`;
    labelClass = options.class.label || `${className}${classStyle}-label`;
    countClass = options.class.count || `${className}${classStyle}-count`;

    labelSpan = Object.prototype.hasOwnProperty.call(options.class, 'label');
  } else {
    className = 'tag';
    ulClass = `${className}${classStyle}`;
    liClass = `${className}${classStyle}-item`;
    aClass = `${className}${classStyle}-link`;
    labelClass = `${className}${classStyle}-label`;
    countClass = `${className}${classStyle}-count`;

    labelSpan = false;
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
      result += transform ? transform(tag.name) : escapeHTML(tag.name);
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
      if (labelSpan) {
        result += `<span class="${labelClass}">${transform ? transform(tag.name) : tag.name}</span>`;
      } else {
        result += transform ? transform(tag.name) : tag.name;
      }

      if (showCount) {
        result += `<span class="${countClass}">${tag.length}</span>`;
      }

      result += '</a>';
    });
  }

  return result;
}

function listTagsHelperFactory(tags, options) {
  const transformArgs = () => {
    if (!options && (!tags || !Object.prototype.hasOwnProperty.call(tags, 'length'))) {
      options = tags;
      tags = this.site.tags;
    }

    return [tags.toArray(), options];
  };

  return moize(listTagsHelper.bind(this), {
    maxSize: 5,
    isDeepEqual: true,
    transformArgs
  }).call(this, tags, options);
}

module.exports = listTagsHelperFactory;
