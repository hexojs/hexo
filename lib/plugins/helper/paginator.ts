import { htmlTag, url_for } from 'hexo-util';
import type Hexo from '../../hexo';

interface Options {
  base?: string;
  current?: number;
  format?: string;
  total?: number;
  end_size?: number;
  mid_size?: number;
  space?: string;
  next_text?: string;
  prev_text?: string;
  prev_next?: boolean;
  escape?: boolean;
  page_class?: string;
  current_class?: string;
  space_class?: string;
  prev_class?: string;
  next_class?: string;
  force_prev_next?: boolean;
  show_all?: boolean;
  transform?: (i: number) => any;
}

const createLink = (options: Options, ctx: Hexo) => {
  const { base, format } = options;

  return (i: number) => url_for.call(ctx, i === 1 ? base : base + format.replace('%d', String(i)));
};

const createPageTag = (options: Options, ctx: Hexo) => {
  const link = createLink(options, ctx);
  const {
    current,
    escape,
    transform,
    page_class: pageClass,
    current_class: currentClass
  } = options;

  return (i: number) => {
    if (i === current) {
      return htmlTag('span', { class: pageClass + ' ' + currentClass }, transform ? transform(i) : i, escape);
    }
    return htmlTag('a', { class: pageClass, href: link(i) }, transform ? transform(i) : i, escape);
  };
};

const showAll = (tags: string[], options: Options, ctx: Hexo) => {
  const { total } = options;

  const pageLink = createPageTag(options, ctx);

  for (let i = 1; i <= total; i++) {
    tags.push(pageLink(i));
  }
};

const paginationPartShow = (tags, options, ctx: Hexo) => {
  const {
    current,
    total,
    space,
    end_size: endSize,
    mid_size: midSize,
    space_class: spaceClass
  } = options;

  const leftEnd = Math.min(endSize, current - 1);
  const rightEnd = Math.max(total - endSize + 1, current + 1);
  const leftMid = Math.max(leftEnd + 1, current - midSize);
  const rightMid = Math.min(rightEnd - 1, current + midSize);
  const spaceHtml = htmlTag('span', { class: spaceClass }, space, false);

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

function paginatorHelper(options: Options = {}) {
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
    escape: true,
    page_class: 'page-number',
    current_class: 'current',
    space_class: 'space',
    prev_class: 'extend prev',
    next_class: 'extend next',
    force_prev_next: false
  }, options);

  const {
    current,
    total,
    prev_text: prevText,
    next_text: nextText,
    prev_next: prevNext,
    escape,
    prev_class: prevClass,
    next_class: nextClass,
    force_prev_next: forcePrevNext
  } = options;

  if (!current) return '';

  const link = createLink(options, this);

  const tags = [];

  // Display the link to the previous page
  if (prevNext && current > 1) {
    tags.push(htmlTag('a', { class: prevClass, rel: 'prev', href: link(current - 1)}, prevText, escape));
  } else if (forcePrevNext) {
    tags.push(htmlTag('span', { class: prevClass, rel: 'prev' }, prevText, escape));
  }

  if (options.show_all) {
    showAll(tags, options, this);
  } else {
    paginationPartShow(tags, options, this);
  }

  // Display the link to the next page
  if (prevNext && current < total) {
    tags.push(htmlTag('a', { class: nextClass, rel: 'next', href: link(current + 1) }, nextText, escape));
  } else if (forcePrevNext) {
    tags.push(htmlTag('span', { class: nextClass, rel: 'next' }, nextText, escape));
  }

  return tags.join('');
}

export = paginatorHelper;
