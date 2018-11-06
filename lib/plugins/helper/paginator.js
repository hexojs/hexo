'use strict';

const { htmlTag } = require('hexo-util');

const createLink = (options, ctx) => {
  const { base, format } = options;

  return i => ctx.url_for(i === 1 ? base : base + format.replace('%d', i));
};

const createPageTag = (options, ctx) => {
  const link = createLink(options, ctx);
  const { current, transform } = options;

  return i => {
    if (i === current) {
      return htmlTag('span', { class: 'page-number current' }, transform ? transform(i) : i);
    }
    return htmlTag('a', { class: 'page-number', href: link(i) }, transform ? transform(i) : i);
  };
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
    prev_next: true
  }, options);

  const {
    current,
    total,
    space,
    end_size: endSize,
    mid_size: midSize,
    prev_text: prevText,
    next_text: nextText,
    prev_next: prevNext
  } = options;

  if (!current) return '';

  const link = createLink(options, this);

  const pageLink = createPageTag(options, this);

  let result = '';
  // Display the link to the previous page
  if (prevNext && current > 1) {
    result += htmlTag('a', { class: 'extend prev', rel: 'prev', href: link(current - 1)}, prevText);
  }

  if (options.show_all) {
    for (let i = 1; i <= total; i++) {
      result += pageLink(i);
    }
  } else {
    // It's too complicated. May need refactor.
    const leftEnd = current <= endSize ? current - 1 : endSize;
    const rightEnd = total - current <= endSize ? current + 1 : total - endSize + 1;
    const leftMid = current - midSize <= endSize ? leftEnd + 1 : current - midSize;
    const rightMid = current + midSize + endSize > total ? rightEnd - 1 : current + midSize;
    const spaceHtml = htmlTag('span', { class: 'space' }, space);

    // Display pages on the left edge
    for (let i = 1; i <= leftEnd; i++) {
      result += pageLink(i);
    }

    // Display spaces between edges and middle pages
    if (space && current - endSize - midSize > 1) {
      result += spaceHtml;
    }

    // Display left middle pages
    if (leftMid > leftEnd) {
      for (let i = leftMid; i < current; i++) {
        result += pageLink(i);
      }
    }

    // Display the current page
    result += pageLink(current);

    // Display right middle pages
    if (rightMid < rightEnd) {
      for (let i = current + 1; i <= rightMid; i++) {
        result += pageLink(i);
      }
    }

    // Display spaces between edges and middle pages
    if (space && total - endSize - midSize > current) {
      result += spaceHtml;
    }

    // Dispaly pages on the right edge
    for (let i = rightEnd; i <= total; i++) {
      result += pageLink(i);
    }
  }

  // Display the link to the next page
  if (prevNext && current < total) {
    result += htmlTag('a', { class: 'extend next', rel: 'next', href: link(current + 1) }, nextText);
  }

  return result;
}

module.exports = paginatorHelper;
