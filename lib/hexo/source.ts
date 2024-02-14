import Box from '../box';
import type Hexo from './index';

class Source extends Box {
  constructor(ctx: Hexo) {
    super(ctx, ctx.source_dir);

    this.processors = ctx.extend.processor.list();
  }
}

export = Source;
