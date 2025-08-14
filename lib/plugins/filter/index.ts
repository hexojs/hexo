import type Hexo from '../../hexo/index.js';
import newPostPath from './new_post_path.js';
import postPermalink from './post_permalink.js';
import afterRender from './after_render/index.js';
import afterPostRender from './after_post_render/index.js';
import beforePostRender from './before_post_render/index.js';
import beforeExit from './before_exit/index.js';
import beforeGenerate from './before_generate/index.js';
import templateLocals from './template_locals/index.js';

const filter = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  afterRender(ctx);
  afterPostRender(ctx);
  beforePostRender(ctx);
  beforeExit(ctx);
  beforeGenerate(ctx);
  templateLocals(ctx);

  filter.register('new_post_path', newPostPath);
  filter.register('post_permalink', postPermalink);
};

// For ESM compatibility
export default filter;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = filter;
  // For ESM compatibility
  module.exports.default = filter;
}
