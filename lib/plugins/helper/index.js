var helper = hexo.extend.helper;

var date = require('./date');

helper.register('date', date.date);
helper.register('date_xml', date.date_xml);
helper.register('time', date.time);
helper.register('full_date', date.full_date);
helper.register('time_tag', date.time_tag);
helper.register('moment', date.moment);

var form = require('./form');

helper.register('search_form', form.search_form);

var format = require('./format');

helper.register('strip_html', format.strip_html);
helper.register('trim', format.trim);
helper.register('titlecase', format.titlecase);
helper.register('markdown', format.markdown);
helper.register('word_wrap', format.word_wrap);
helper.register('truncate', format.truncate);
helper.register('render', format.render);

helper.register('fragment_cache', require('./fragment_cache'));

helper.register('gravatar', require('./gravatar'));

var is = require('./is');

helper.register('is_current', is.is_current);
helper.register('is_home', is.is_home);
helper.register('is_post', is.is_post);
helper.register('is_archive', is.is_archive);
helper.register('is_year', is.is_year);
helper.register('is_month', is.is_month);
helper.register('is_category', is.is_category);
helper.register('is_tag', is.is_tag);

var list = require('./list'),
  listPost = require('./list_post');

helper.register('list_categories', list.list_categories);
helper.register('list_tags', list.list_tags);
helper.register('list_archives', list.list_archives);
helper.register('list_posts', listPost.list_posts);
helper.register('get_posts', listPost.get_posts);

helper.register('open_graph', require('./open_graph'));

var number = require('./number');

helper.register('number_format', number.number_format);

helper.register('paginator', require('./paginator'));

helper.register('partial', require('./partial'));

var tag = require('./tag');

helper.register('css', tag.css);
helper.register('js', tag.js);
helper.register('link_to', tag.link_to);
helper.register('mail_to', tag.mail_to);
helper.register('image_tag', tag.image_tag);
helper.register('favicon_tag', tag.favicon_tag);
helper.register('feed_tag', tag.feed_tag);

var tagcloud = require('./tagcloud');

helper.register('tagcloud', tagcloud);
helper.register('tag_cloud', tagcloud);

helper.register('toc', require('./toc'));

var url = require('./url');

helper.register('relative_url', url.relative_url);
helper.register('url_for', url.url_for);