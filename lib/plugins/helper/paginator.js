'use strict';

const { htmlTag, url_for } = require('hexo-util');

const createLink = (options, ctx) => {
  const { base, format } = options;

  return i => url_for.call(ctx, i === 1 ? base : base + format.replace('%d', i));
};

const createPageTag = (options, ctx) => {
  const link = createLink(options, ctx);
  const { current, escape, transform } = options;

  return i => {
    if (i === current) {
      return htmlTag('span', { class: 'page-number current' }, transform ? transform(i) : i, escape);
    }
    return htmlTag('a', { class: 'page-number', href: link(i) }, transform ? transform(i) : i, escape);
  };
};

const showAll = (tags, options, ctx) => {
  const { total } = options;

  const pageLink = createPageTag(options, ctx);

  for (let i = 1; i <= total; i++) {
    tags.push(pageLink(i));
  }
};

const pagenasionPartShow = (tags, options, ctx) => {
  const {
    current,
    total,
    space,
    end_size: endSize,
    mid_size: midSize
  } = options;

  const leftEnd = Math.min(endSize, current - 1);
  const rightEnd = Math.max(total - endSize + 1, current + 1);
  const leftMid = Math.max(leftEnd + 1, current - midSize);
  const rightMid = Math.min(rightEnd - 1, current + midSize);
  const spaceHtml = htmlTag('span', { class: 'space' }, space, false);

  const pageTag = createPageTag(options, ctx);

  // Display pages on the left edge
  for (let i = 1; i <= leftEnd; i++) {
    tags.push(pageTag(i));
  }

  // Display spaces between edges and middle pages
  if (space && leftMid - leftEnd > 1) {
    tags.push(spaceHtml);
  }

  // Display left middle pages
  for (let i = leftMid; i < current; i++) {
    tags.push(pageTag(i));
  }

  // Display the current page
  tags.push(pageTag(current));

  // Display right middle pages
  for (let i = current + 1; i <= rightMid; i++) {
    tags.push(pageTag(i));
  }

  // Display spaces between edges and middle pages
  if (space && rightEnd - rightMid > 1) {
    tags.push(spaceHtml);
  }

  // Display pages on the right edge
  for (let i = rightEnd; i <= total; i++) {
    tags.push(pageTag(i));
  }
};

function paginatorHelper(options = {}) {
  options = Object.assign({
    base: this.page.base || '',
    current: this.page.current || 0,
    format: `${this.config.pagination_dir}/%d/`,
    total: this.page.total || 1,
    end_size: 1,
    mid_size: 2,
    space: '&hellip;',
    next_text: 'Next',
    prev_text: 'Prev',
    prev_next: true,
    escape: true
  }, options);

  const {
    current,
    total,
    prev_text: prevText,
    next_text: nextText,
    prev_next: prevNext,
    escape
  } = options;

  if (!current) return '';

  const link = createLink(options, this);

  const tags = [];

  // Display the link to the previous page
  if (prevNext && current > 1) {
    tags.push(htmlTag('a', { class: 'extend prev', rel: 'prev', href: link(current - 1)}, prevText, escape));
  }

  if (options.show_all) {
    showAll(tags, options, this);
  } else {
    pagenasionPartShow(tags, options, this);
  }

  // Display the link to the next page
  if (prevNext && current < total) {
    tags.push(htmlTag('a', { class: 'extend next', rel: 'next', href: link(current + 1) }, nextText, escape));
  }

  return tags.join('');
}

module.exports = paginatorHelper;
