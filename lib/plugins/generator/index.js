var generator = hexo.extend.generator;

generator.register(require('./archive'));
generator.register(require('./category'));
generator.register(require('./home'));
generator.register(require('./page'));
generator.register(require('./post'));
generator.register(require('./tag'));
generator.register(require('./asset'));