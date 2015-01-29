'use strict';

module.exports = function(ctx){
  var generator = ctx.extend.generator;

  generator.register('asset', require('./asset'));
  generator.register('page', require('./page'));
  generator.register('post', require('./post'));
};