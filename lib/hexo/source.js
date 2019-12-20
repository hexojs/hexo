'use strict';

const Box = require('../box');
const { inherits } = require('util');

function Source(ctx) {
  Reflect.apply(Box, this, [ctx, ctx.source_dir]);

  this.processors = ctx.extend.processor.list();
}

inherits(Source, Box);

module.exports = Source;
