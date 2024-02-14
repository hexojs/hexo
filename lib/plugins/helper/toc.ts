import { tocObj, escapeHTML, encodeURL } from 'hexo-util';

interface Options {
  min_depth?: number;
  max_depth?: number;
  class?: string;
  class_item?: string;
  class_link?: string;
  class_text?: string;
  class_child?: string;
  class_number?: string;
  class_level?: string;
  list_number?: boolean;
}

function tocHelper(str: string, options: Options = {}) {
  options = Object.assign({
    min_depth: 1,
    max_depth: 6,
    class: 'toc',
    class_item: '',
    class_link: '',
    class_text: '',
    class_child: '',
    class_number: '',
    class_level: '',
    list_number: true
  }, options);

  const data = tocObj(str, { min_depth: options.min_depth, max_depth: options.max_depth });

  if (!data.length) return '';

  const className = escapeHTML(options.class);
  const itemClassName = escapeHTML(options.class_item || options.class + '-item');
  const linkClassName = escapeHTML(options.class_link || options.class + '-link');
  const textClassName = escapeHTML(options.class_text || options.class + '-text');
  const childClassName = escapeHTML(options.class_child || options.class + '-child');
  const numberClassName = escapeHTML(options.class_number || options.class + '-number');
  const levelClassName = escapeHTML(options.class_level || options.class + '-level');
  const listNumber = options.list_number;

  let result = `<ol class="${className}">`;

  const lastNumber = [0, 0, 0, 0, 0, 0];
  let firstLevel = 0;
  let lastLevel = 0;

  for (let i = 0, len = data.length; i < len; i++) {
    const el = data[i];
    const { level, id, text } = el;
    const href = id ? `#${encodeURL(id)}` : null;

    if (!el.unnumbered) {
      lastNumber[level - 1]++;
    }

    for (let i = level; i <= 5; i++) {
      lastNumber[i] = 0;
    }

    if (firstLevel) {
      for (let i = level; i < lastLevel; i++) {
        result += '</li></ol>';
      }

      if (level > lastLevel) {
        result += `<ol class="${childClassName}">`;
      } else {
        result += '</li>';
      }
    } else {
      firstLevel = level;
    }

    result += `<li class="${itemClassName} ${levelClassName}-${level}">`;
    if (href) {
      result += `<a class="${linkClassName}" href="${href}">`;
    } else {
      result += `<a class="${linkClassName}">`;
    }

    if (listNumber && !el.unnumbered) {
      result += `<span class="${numberClassName}">`;

      for (let i = firstLevel - 1; i < level; i++) {
        result += `${lastNumber[i]}.`;
      }

      result += '</span> ';
    }

    result += `<span class="${textClassName}">${text}</span></a>`;

    lastLevel = level;
  }

  for (let i = firstLevel - 1; i < lastLevel; i++) {
    result += '</li></ol>';
  }

  return result;
}

export = tocHelper;
