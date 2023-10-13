export = ctx => function render(text, engine, options) {
  return ctx.render.renderSync({
    text,
    engine
  }, options);
};
