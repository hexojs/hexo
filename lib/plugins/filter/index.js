var filter = hexo.extend.filter;

filter.register('beforePostRender', require('./backtick_code_block'));
filter.register('beforePostRender', require('./titlecase'));

filter.register('afterPostRender', require('./auto_spacing'));
filter.register('afterPostRender', require('./external_link'));
filter.register('afterPostRender', require('./excerpt'));