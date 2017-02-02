'use strict';

module.exports = function(ctx) {
  var processor = ctx.extend.processor;

  function register(name) {
    var obj = require('./' + name)(ctx);
    processor.register(obj.pattern, obj.process);
  }

  register('asset');
  register('data');
  register('post');
};
