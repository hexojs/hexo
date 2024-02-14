// Based on: https://raw.github.com/imathis/octopress/master/plugins/blockquote.rb

import titlecase from 'titlecase';
import type Hexo from '../../hexo';

const rFullCiteWithTitle = /(\S.*)\s+(https?:\/\/\S+)\s+(.+)/i;
const rFullCite = /(\S.*)\s+(https?:\/\/\S+)/i;
const rAuthorTitle = /([^,]+),\s*([^,]+)/;

/**
 * @param {string[]} args
 * @param {Hexo} ctx
 */
const parseFooter = (args: string[], ctx: Hexo) => {
  const str = args.join(' ');
  if (!str) return '';

  let author = '';
  let source = '';
  let title = '';
  let match;

  if ((match = rFullCiteWithTitle.exec(str))) {
    author = match[1];
    source = match[2];
    title = ctx.config.titlecase ? titlecase(match[3]) : match[3];
  } else if ((match = rFullCite.exec(str))) {
    author = match[1];
    source = match[2];
  } else if ((match = rAuthorTitle.exec(str))) {
    author = match[1];
    title = ctx.config.titlecase ? titlecase(match[2]) : match[2];
  } else {
    author = str;
  }

  let footer = '';
  if (author) footer += `<strong>${author}</strong>`;

  if (source) {
    const link = source.replace(/^https?:\/\/|\/(index.html?)?$/g, '');
    footer += `<cite><a href="${source}">${title ? title : link}</a></cite>`;
  } else if (title) {
    footer += `<cite>${title}</cite>`;
  }

  return footer;
};

/**
* Blockquote tag
*
* Syntax:
*   {% blockquote [author[, source]] [link] [source_link_title] %}
*   Quote string
*   {% endblockquote %}
*/

export = (ctx: Hexo) => function blockquoteTag(args: string[], content: string) {
  const footer = parseFooter(args, ctx);

  let result = '<blockquote>';
  result += ctx.render.renderSync({text: content, engine: 'markdown'});
  if (footer) result += `<footer>${footer}</footer>`;
  result += '</blockquote>';

  return result;
};
