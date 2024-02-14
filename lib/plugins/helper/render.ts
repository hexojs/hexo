import type Hexo from '../../hexo';

export = (ctx: Hexo) => function render(text: string, engine: string, options:object = {}) {
  return ctx.render.renderSync({
    text,
    engine
  }, options);
};
