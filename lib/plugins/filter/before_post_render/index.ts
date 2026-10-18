import type Hexo from '../../../hexo';

export = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('before_post_render', require('./titlecase'));
};
