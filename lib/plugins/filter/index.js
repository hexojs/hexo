var filter = hexo.extend.filter;

filter.register('pre', require('./backtick_code_block'));
filter.register('pre', require('./titlecase'));

filter.register('post', require('./auto_spacing'));
filter.register('post', require('./external_link'));
filter.register('post', require('./excerpt'));