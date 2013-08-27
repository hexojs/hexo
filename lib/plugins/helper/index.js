var helper = hexo.extend.helper;

helper.register('css', require('./css'));

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

helper.register('js', require('./js'));

var link = require('./link');

helper.register('link_to', link.link_to);
helper.register('mail_to', link.mail_to);

var number = require('./number');

helper.register('number_format', number.number_format);

helper.register('paginator', require('./paginator'));

helper.register('partial', require('./partial'));

helper.register('tagcloud', require('./tagcloud'));