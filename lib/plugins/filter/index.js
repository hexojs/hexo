var filter = hexo.extend.filter;

filter.register('before_post_render', require('./backtick_code_block'));
filter.register('before_post_render', require('./titlecase'));

filter.register('after_post_render', require('./external_link'));
filter.register('after_post_render', require('./excerpt'));

filter.register('new_post_path', require('./new_post_path'));

filter.register('post_permalink', require('./post_permalink'));

filter.register('server_middleware', require('./middlewares/logger'));
filter.register('server_middleware', require('./middlewares/header'));
filter.register('server_middleware', require('./middlewares/route'));
filter.register('server_middleware', require('./middlewares/static'));
filter.register('server_middleware', require('./middlewares/redirect'));
filter.register('server_middleware', require('./middlewares/gzip'));