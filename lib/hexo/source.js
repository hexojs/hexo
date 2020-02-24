'use strict';

const Box = require('../box');

class Source extends Box {
  constructor(ctx) {
    super(ctx, ctx.source_dir);

    this.processors = ctx.extend.processor.list();
  }
}

module.exports = Source;
