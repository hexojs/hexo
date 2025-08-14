import type Hexo from '../../../hexo/index.js';
import i18n from './i18n.js';

const templateLocals = (ctx: Hexo) => {
  const { filter } = ctx.extend;
  filter.register('template_locals', i18n);
};

// For ESM compatibility
export default templateLocals;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = templateLocals;
  // For ESM compatibility
  module.exports.default = templateLocals;
}
