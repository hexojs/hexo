import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  const { generator } = ctx.extend;

  generator.register('code', require('./code'));
  generator.register('asset', require('./asset'));
  generator.register('page', require('./page'));
  generator.register('post', require('./post'));
};
