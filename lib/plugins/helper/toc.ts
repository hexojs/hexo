import { tocObj, escapeHTML } from 'hexo-util';

interface Options {
  min_depth?: number;
  max_depth?: number;
  max_items?: number;
  class?: string;
  class_item?: string;
  class_link?: string;
  class_text?: string;
  class_child?: string;
  class_number?: string;
  class_level?: string;
  list_number?: boolean;
}

/**
 * Hexo TOC helper: generates a nested <ol> list from markdown headings
 * @param {string} str      Raw markdown/html string
 * @param {Options} options Configuration options
 */
function tocHelper(str, options: Options = {}) {
  // Default options
  options = Object.assign({
    min_depth: 1,
    max_depth: 6,
    max_items: Infinity,
    class: 'toc',
    class_item: '',
    class_link: '',
    class_text: '',
    class_child: '',
    class_number: '',
    class_level: '',
    list_number: true
  }, options);

  // Extract and truncate flat TOC data
  const flat = getAndTruncateTocObj(
    str,
    { min_depth: options.min_depth, max_depth: options.max_depth },
    options.max_items
  );
  if (!flat.length) return '';

  // Prepare class names
  const className = escapeHTML(options.class);
  const itemClassName = escapeHTML(options.class_item || options.class + '-item');
  const linkClassName = escapeHTML(options.class_link || options.class + '-link');
  const textClassName = escapeHTML(options.class_text || options.class + '-text');
  const childClassName = escapeHTML(options.class_child || options.class + '-child');
  const numberClassName = escapeHTML(options.class_number || options.class + '-number');
  const levelClassName = escapeHTML(options.class_level || options.class + '-level');
  const listNumber = options.list_number;

  // Build tree, assign numbers, render HTML
  const tree = buildTree(flat);
  if (listNumber) assignNumbers(tree);

  function render(list, depth = 0) {
    if (!list.length) return '';
    const olCls = depth === 0 ? className : childClassName;
    let out = `<ol class="${olCls}">`;

    list.forEach(node => {
      const lvl = node.level;
      out += `<li class="${itemClassName} ${levelClassName}-${lvl}">`;
      out += `<a class="${linkClassName}"${node.id ? ` href="#${encodeURI(node.id)}"` : ''}>`;
      if (listNumber && !node.unnumbered) {
        out += `<span class="${numberClassName}">${node.number}</span> `;
      }
      out += `<span class="${textClassName}">${node.text}</span></a>`;
      out += render(node.children, depth + 1);
      out += '</li>';
    });

    out += '</ol>';
    return out;
  }

  return render(tree);
}

/**
 * Extract flat TOC data and enforce max_items
 */
function getAndTruncateTocObj(str, { min_depth, max_depth }, max_items) {
  let data = tocObj(str, { min_depth, max_depth });
  if (max_items < Infinity && data.length > max_items) {
    const levels = data.map(i => i.level);
    const min = Math.min(...levels);
    let curMax = Math.max(...levels);
    // remove deeper headings until within limit
    while (data.length > max_items && curMax > min) {
      // eslint-disable-next-line no-loop-func
      data = data.filter(i => i.level < curMax);
      curMax--;
    }
    data = data.slice(0, max_items);
  }
  return data;
}

/**
 * Build nested tree from flat heading list
 */
function buildTree(headings) {
  const root = { level: 0, children: [] };
  const stack = [root];

  headings.forEach(h => {
    // pop until parent.level < h.level
    while (stack[stack.length - 1].level >= h.level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    const node = { ...h, children: [] };
    parent.children.push(node);
    stack.push(node);
  });

  return root.children;
}

/**
 * Assign hierarchical numbering to each node
 */
function assignNumbers(nodes) {
  const counters = [];
  function dfs(list, depth) {
    counters[depth] = 0;
    list.forEach(node => {
      counters[depth]++;
      node.number = counters.slice(0, depth + 1).join('.') + '.';
      if (node.children.length) dfs(node.children, depth + 1);
    });
  }
  dfs(nodes, 0);
}

export = tocHelper;
