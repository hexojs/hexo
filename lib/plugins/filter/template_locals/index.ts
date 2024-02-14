import type Hexo from '../../../hexo';

export = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('template_locals', require('./i18n'));
};
