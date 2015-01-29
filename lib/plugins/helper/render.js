'use strict';

module.exports = function(ctx){
  return function render(text, engine, options){
    return ctx.render.renderSync({
      text: text,
      engine: engine
    }, options);
  };
};