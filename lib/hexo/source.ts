import Box from '../box';

class Source extends Box {
  constructor(ctx) {
    super(ctx, ctx.source_dir);

    this.processors = ctx.extend.processor.list();
  }
}

export = Source;
