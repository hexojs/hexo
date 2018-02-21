'use strict';

module.exports = ctx => {
  const generator = ctx.extend.generator;

  generator.register('asset', require('./asset'));
  generator.register('page', require('./page'));
  generator.register('post', require('./post'));
};
