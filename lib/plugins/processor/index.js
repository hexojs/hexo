'use strict';

module.exports = ctx => {
  const { processor } = ctx.extend;

  function register(name) {
    const obj = require(`./${name}`)(ctx);
    processor.register(obj.pattern, obj.process);
  }

  register('asset');
  register('data');
  register('post');
};
