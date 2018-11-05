'use strict';

function listTagsHelper(tags, options) {
  if (!options && (!tags || !tags.hasOwnProperty('length'))) {
    options = tags;
    tags = this.site.tags;
  }

  if (!tags || !tags.length) return '';
  options = options || {};

  const { style = 'list', transform, separator = ', ', suffix = '' } = options;
  const showCount = options.hasOwnProperty('show_count') ? options.show_count : true;
  const className = options.class || 'tag';
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
    result += `<ul class="${className}-list">`;

    tags.forEach(tag => {
      result += `<li class="${className}-list-item">`;

      result += `<a class="${className}-list-link" href="${this.url_for(tag.path)}${suffix}">`;
      result += transform ? transform(tag.name) : tag.name;
      result += '</a>';

      if (showCount) {
        result += `<span class="${className}-list-count">${tag.length}</span>`;
      }

      result += '</li>';
    });

    result += '</ul>';
  } else {
    tags.forEach((tag, i) => {
      if (i) result += separator;

      result += `<a class="${className}-link" href="${this.url_for(tag.path)}${suffix}">`;
      result += transform ? transform(tag.name) : tag.name;

      if (showCount) {
        result += `<span class="${className}-count">${tag.length}</span>`;
      }

      result += '</a>';
    });
  }

  return result;
}

module.exports = listTagsHelper;
