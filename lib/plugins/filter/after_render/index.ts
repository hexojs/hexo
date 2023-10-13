export = ctx => {
  const { filter } = ctx.extend;

  filter.register('after_render:html', require('./external_link'));
  filter.register('after_render:html', require('./meta_generator'));
};
