export = ctx => {
  const { filter } = ctx.extend;

  filter.register('template_locals', require('./i18n'));
};
