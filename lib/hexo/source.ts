import Box from '../box/index.js';
import type Hexo from './index.js';

class Source extends Box {
  constructor(ctx: Hexo) {
    super(ctx, ctx.source_dir);

    this.processors = ctx.extend.processor.list();
  }
}

// For ESM/CommonJS compatibility
export default Source;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = Source;
  module.exports.default = Source;
}
