var generator = hexo.extend.generator;

generator.register('archive', require('./archive'));
generator.register('category', require('./category'));
generator.register('home', require('./home'));
generator.register('page', require('./page'));
generator.register('post', require('./post'));
generator.register('tag', require('./tag'));
generator.register('asset', require('./asset'));