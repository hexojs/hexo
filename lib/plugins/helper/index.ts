import type Hexo from '../../hexo/index.js';
import css from './css.js';
import * as date from './date.js';
import * as debug from './debug.js';
import faviconTag from './favicon_tag.js';
import feedTag from './feed_tag.js';
import * as format from './format.js';
import fragmentCache from './fragment_cache.js';
import fullUrlFor from './full_url_for.js';
import gravatar from './gravatar.js';
import imageTag from './image_tag.js';
import * as is from './is.js';
import js from './js.js';
import linkTo from './link_to.js';
import listArchives from './list_archives.js';
import listCategories from './list_categories.js';
import listPosts from './list_posts.js';
import listTags from './list_tags.js';
import mailTo from './mail_to.js';
import markdown from './markdown.js';
import metaGenerator from './meta_generator.js';
import numberFormat from './number_format.js';
import openGraph from './open_graph.js';
import paginator from './paginator.js';
import partial from './partial.js';
import relativeUrl from './relative_url.js';
import render from './render.js';
import searchForm from './search_form.js';
import tagcloud from './tagcloud.js';
import toc from './toc.js';
import urlFor from './url_for.js';

const helperIndex = (ctx: Hexo) => {
  const { helper } = ctx.extend;

  helper.register('date', date.date as any);
  helper.register('date_xml', date.date_xml);
  helper.register('time', date.time as any);
  helper.register('full_date', date.full_date as any);
  helper.register('relative_date', date.relative_date as any);
  helper.register('time_tag', date.time_tag as any);
  helper.register('moment', date.moment as any);

  helper.register('search_form', searchForm as any);

  const { strip_html, trim, titlecase, word_wrap, truncate, escape_html } = format;
  helper.register('strip_html', strip_html);
  helper.register('trim', trim);
  helper.register('titlecase', titlecase);
  helper.register('word_wrap', word_wrap);
  helper.register('truncate', truncate);
  helper.register('escape_html', escape_html);

  helper.register('fragment_cache', fragmentCache(ctx));

  helper.register('gravatar', gravatar);

  helper.register('is_current', is.current as any);
  helper.register('is_home', is.home as any);
  helper.register('is_home_first_page', is.home_first_page as any);
  helper.register('is_post', is.post as any);
  helper.register('is_page', is.page as any);
  helper.register('is_archive', is.archive as any);
  helper.register('is_year', is.year as any);
  helper.register('is_month', is.month as any);
  helper.register('is_category', is.category as any);
  helper.register('is_tag', is.tag as any);

  helper.register('list_archives', listArchives as any);
  helper.register('list_categories', listCategories as any);
  helper.register('list_tags', listTags as any);
  helper.register('list_posts', listPosts as any);

  helper.register('meta_generator', metaGenerator as any);

  helper.register('open_graph', openGraph as any);

  helper.register('number_format', numberFormat as any);

  helper.register('paginator', paginator as any);

  helper.register('partial', partial(ctx) as any);

  helper.register('markdown', markdown as any);
  helper.register('render', render(ctx) as any);

  helper.register('css', css as any);
  helper.register('js', js as any);
  helper.register('link_to', linkTo as any);
  helper.register('mail_to', mailTo as any);
  helper.register('image_tag', imageTag as any);
  helper.register('favicon_tag', faviconTag as any);
  helper.register('feed_tag', feedTag as any);

  helper.register('tagcloud', tagcloud as any);
  helper.register('tag_cloud', tagcloud as any);

  helper.register('toc', toc as any);

  helper.register('relative_url', relativeUrl as any);
  helper.register('url_for', urlFor as any);
  helper.register('full_url_for', fullUrlFor as any);

  helper.register('inspect', debug.inspectObject as any);
  helper.register('log', debug.log as any);
};

export default helperIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = helperIndex;
  module.exports.default = helperIndex;
}
