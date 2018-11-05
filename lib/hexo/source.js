'use strict';

const Box = require('../box');
const util = require('util');

function Source(ctx) {
  Reflect.apply(Box, this, [ctx, ctx.source_dir]);

  this.processors = ctx.extend.processor.list();
}

util.inherits(Source, Box);

module.exports = Source;
