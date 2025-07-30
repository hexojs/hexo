import type Hexo from '../../hexo/index.js';
import * as highlightjsModule from './highlight';
import * as prismModule from './prism';

const highlightjs = (highlightjsModule as any).default || (highlightjsModule as any);
const prism = (prismModule as any).default || (prismModule as any);


const registerHighlight = (ctx: Hexo) => {
  const { highlight } = ctx.extend;

  highlight.register('highlight.js', highlightjs);
  highlight.register('prismjs', prism);
};

// Support both ESM and CommonJS
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = registerHighlight;
  module.exports.default = registerHighlight;
}

export default registerHighlight;
