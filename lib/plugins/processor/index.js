var processor = hexo.extend.processor;

processor.register('_posts/*path', require('./post'));

processor.register(/^[^_](?:(?!\/_).)*$/, require('./page'));