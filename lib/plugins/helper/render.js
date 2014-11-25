exports.markdown = function(text, options){
  return this.render(text, 'markdown', options);
};

exports.render = function(ctx){
  return function(text, engine, locals){
    return ctx.render.renderSync({
      text: text,
      engine: engine
    }, locals);
  };
};